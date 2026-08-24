import Stripe from 'stripe';
import { PrismaClient } from '@microintern/database';
import { config } from '@/core/config.js';
import { NotFoundError, BadRequestError } from '@/shared/errors/index.js';

export class EkycUseCase {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY || 'sk_test_123', {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }

  // ---------------------------------------------------------
  // Option 1: Stripe Identity Integration
  // ---------------------------------------------------------

  /**
   * Generates a Stripe Identity VerificationSession for the given company.
   */
  async generateStripeSession(companyId: string): Promise<{ clientSecret: string; sessionId: string }> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.ekycStatus === 'VERIFIED_STRIPE' || company.ekycStatus === 'VERIFIED_MANUAL') {
      throw new BadRequestError('Company is already verified');
    }

    if (!config.STRIPE_SECRET_KEY) {
      throw new BadRequestError('Stripe identity is not configured on this server');
    }

    // Create a Stripe Identity VerificationSession
    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        companyId: company.id,
      },
      options: {
        document: {
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      }
    });

    if (!session.client_secret) {
      throw new BadRequestError('Failed to generate Stripe Identity session');
    }

    // Save the session ID to the company
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        stripeIdentitySessionId: session.id,
      }
    });

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  }

  /**
   * Processes Stripe webhooks to automatically update eKYC status.
   */
  async handleStripeWebhook(payload: string | Buffer, signature: string): Promise<void> {
    if (!config.STRIPE_WEBHOOK_SECRET) {
      throw new BadRequestError('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, config.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Stripe Webhook Signature Verification Failed.', err.message);
      throw new BadRequestError(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const companyId = session.metadata?.['companyId'];

      if (companyId) {
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            ekycStatus: 'VERIFIED_STRIPE',
          }
        });
        console.log(`[Stripe Webhook] Company ${companyId} successfully verified via Identity`);
      }
    } else if (event.type === 'identity.verification_session.canceled' || event.type === 'identity.verification_session.requires_input') {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const companyId = session.metadata?.['companyId'];
      if (companyId) {
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            ekycStatus: 'UNVERIFIED',
            stripeIdentitySessionId: null
          }
        });
      }
    }
  }

  // ---------------------------------------------------------
  // Option 3: Manual Workflow Integration
  // ---------------------------------------------------------

  /**
   * Upload documents manually for review by Super Admin.
   */
  async uploadManualDocuments(companyId: string, documentUrls: string[]): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.ekycStatus === 'VERIFIED_STRIPE' || company.ekycStatus === 'VERIFIED_MANUAL') {
      throw new BadRequestError('Company is already verified');
    }

    // In a real production app, we would validate and upload to S3 here.
    // For now, we assume the frontend sends the pre-signed URLs or S3 bucket keys.
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ekycStatus: 'PENDING_MANUAL_REVIEW',
        ekycDocuments: documentUrls,
      }
    });
  }

  /**
   * Approve a manual verification (Super Admin only).
   */
  async approveManualVerification(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.ekycStatus !== 'PENDING_MANUAL_REVIEW') {
      throw new BadRequestError(`Cannot approve company with status ${company.ekycStatus}`);
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ekycStatus: 'VERIFIED_MANUAL',
      }
    });
  }
}
