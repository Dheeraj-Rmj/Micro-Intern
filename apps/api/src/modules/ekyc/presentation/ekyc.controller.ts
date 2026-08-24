import { Request, Response, NextFunction } from 'express';
import { EkycUseCase } from '../application/use-cases/ekyc.usecase.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

export class EkycController {
  constructor(private readonly ekycUseCase: EkycUseCase) {}

  /**
   * POST /api/v1/ekyc/stripe/session
   * Create a Stripe Identity session for the authenticated company owner.
   */
  async createStripeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.companyId; // Assuming authenticate middleware sets this
      if (!companyId) {
        throw new UnauthorizedError('User is not associated with any company');
      }

      const result = await this.ekycUseCase.generateStripeSession(companyId);
      
      ResponseFormatter.success(res, {
        data: result,
        message: 'Stripe Identity session created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ekyc/stripe/webhook
   * Handle Stripe Webhook events. Must use raw body.
   */
  async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      // Stripe requires the raw, unparsed body to verify the signature
      const payload = req.body; 

      await this.ekycUseCase.handleStripeWebhook(payload, signature);
      
      res.status(200).send('Webhook handled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ekyc/manual/upload
   * Upload manual documents for review.
   */
  async uploadManualDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        throw new UnauthorizedError('User is not associated with any company');
      }

      const { documentUrls } = req.body; // Expecting array of strings
      
      await this.ekycUseCase.uploadManualDocuments(companyId, documentUrls || []);
      
      ResponseFormatter.success(res, {
        data: null,
        message: 'Documents submitted for manual review successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ekyc/manual/approve/:companyId
   * SuperAdmin approves manual eKYC for a company.
   */
  async approveManualVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Security Check: Ensure only super admins can call this endpoint
      if (req.user?.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Only Super Admins can approve eKYC');
      }

      const { companyId } = req.params;
      
      await this.ekycUseCase.approveManualVerification(companyId as string);
      
      ResponseFormatter.success(res, {
        data: null,
        message: 'Company eKYC approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
