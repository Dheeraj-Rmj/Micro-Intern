import Stripe from "stripe";
import { PrismaClient } from "@microintern/database";
import { config } from "@/core/config.js";
import { logger } from "@/core/logger.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";

import Tesseract from "tesseract.js";
// mrz is dynamically imported later because it is ESM only
import { PDFDocument, StandardFonts } from "pdf-lib";
import { EncryptionService } from "@/shared/encryption.service.js";
import { v4 as uuidv4 } from "uuid";
import { OnboardingStatus } from "@microintern/database";
import bcrypt from "bcryptjs";

/** Default temporary password assigned to eKYC-provisioned company owners.
 * The user is forced to change it on first login via forcePasswordChange: true. */
const EKYC_DEFAULT_PASSWORD = "ChangeMe123!";

export class EkycUseCase {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY || "sk_test_123", {
      apiVersion: "2024-11-20.acacia" as any,
    });
  }

  // ---------------------------------------------------------
  // Option 1: Stripe Identity Integration
  // ---------------------------------------------------------

  /**
   * Generates a Stripe Identity VerificationSession for the given company.
   */
  async generateStripeSession(
    companyId: string,
  ): Promise<{ clientSecret: string; sessionId: string }> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    if (company.ekycStatus === "VERIFIED_STRIPE" || company.ekycStatus === "VERIFIED_MANUAL") {
      throw new BadRequestError("Company is already verified");
    }

    if (!config.STRIPE_SECRET_KEY) {
      throw new BadRequestError("Stripe identity is not configured on this server");
    }

    // Create a Stripe Identity VerificationSession
    const session = await this.stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        companyId: company.id,
      },
      options: {
        document: {
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    if (!session.client_secret) {
      throw new BadRequestError("Failed to generate Stripe Identity session");
    }

    // Save the session ID to the company
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        stripeIdentitySessionId: session.id,
      },
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
      throw new BadRequestError("Stripe webhook secret is not configured");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, config.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      logger.error({ err }, "Stripe Webhook Signature Verification Failed.");
      throw new BadRequestError(`Webhook Error: ${err.message}`);
    }

    if (event.type === "identity.verification_session.verified") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const companyId = session.metadata?.["companyId"];

      if (companyId) {
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            ekycStatus: "VERIFIED_STRIPE",
          },
        });
        logger.info({ companyId }, "[Stripe Webhook] Company successfully verified via Identity");
      }
    } else if (
      event.type === "identity.verification_session.canceled" ||
      event.type === "identity.verification_session.requires_input"
    ) {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const companyId = session.metadata?.["companyId"];
      if (companyId) {
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            ekycStatus: "UNVERIFIED",
            stripeIdentitySessionId: null,
          },
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
      throw new NotFoundError("Company not found");
    }

    if (company.ekycStatus === "VERIFIED_STRIPE" || company.ekycStatus === "VERIFIED_MANUAL") {
      throw new BadRequestError("Company is already verified");
    }

    // In a real production app, we would validate and upload to S3 here.
    // For now, we assume the frontend sends the pre-signed URLs or S3 bucket keys.
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ekycStatus: "PENDING_MANUAL_REVIEW",
        ekycDocuments: documentUrls,
      },
    });
  }

  /**
   * Approve a manual verification (Super Admin only).
   */
  async approveManualVerification(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    if (company.ekycStatus !== "PENDING_MANUAL_REVIEW") {
      throw new BadRequestError(`Cannot approve company with status ${company.ekycStatus}`);
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ekycStatus: "VERIFIED_MANUAL",
      },
    });
  }

  // ---------------------------------------------------------
  // Onboarding eKYC Workflow Integration
  // ---------------------------------------------------------

  async validateToken(token: string): Promise<any> {
    const onboarding = await this.prisma.companyOnboarding.findUnique({
      where: { token },
    });
    if (!onboarding) throw new NotFoundError("Invalid onboarding token");

    if (onboarding.signatureUrl) {
      onboarding.signatureUrl = EncryptionService.decrypt(onboarding.signatureUrl);
    }
    if (onboarding.govDocUrls && Array.isArray(onboarding.govDocUrls)) {
      onboarding.govDocUrls = onboarding.govDocUrls.map((url) =>
        EncryptionService.decrypt(url as string),
      );
    }
    return onboarding;
  }

  async submitData(token: string, data: any): Promise<any> {
    const onboarding = await this.validateToken(token);

    if (onboarding.status !== "PENDING") {
      throw new BadRequestError("Onboarding already submitted");
    }

    // Attempt automated doc verification
    let docVerificationScore: any = { status: "PENDING", score: 0 };

    if (data.govDocUrls && data.govDocUrls.length > 0) {
      try {
        const imageUrl = data.govDocUrls[0];

        const worker = await Tesseract.createWorker("eng");
        const ret = await worker.recognize(imageUrl);
        const text = ret.data.text;
        await worker.terminate();

        // Extract MRZ lines
        const mrzLines = text
          .split("\n")
          .filter((l: string) => l.includes("<<"))
          .slice(-2);
        if (mrzLines.length > 0) {
          const mrzText = mrzLines.join("\n");
          const mrzModule = await import("mrz");
          const mrzParse = mrzModule.parse(mrzText);
          if (mrzParse.valid) {
            docVerificationScore = { status: "AUTO_VERIFIED", score: 100, details: mrzParse };
          } else {
            docVerificationScore = {
              status: "REQUIRES_MANUAL_REVIEW",
              score: 50,
              details: mrzParse,
            };
          }
        } else {
          docVerificationScore = {
            status: "REQUIRES_MANUAL_REVIEW",
            score: 0,
            reason: "MRZ not found",
          };
        }
      } catch (error) {
        docVerificationScore = {
          status: "ERROR",
          message: "Failed to process document automatically",
        };
      }
    }

    let nextStatus =
      docVerificationScore.status === "AUTO_VERIFIED"
        ? OnboardingStatus.AUTO_VERIFIED
        : OnboardingStatus.SUBMITTED;

    const encryptedGovDocUrls = data.govDocUrls
      ? data.govDocUrls.map((url: string) => EncryptionService.encrypt(url))
      : [];
    const encryptedSignatureUrl = data.signatureUrl
      ? EncryptionService.encrypt(data.signatureUrl)
      : null;

    return await this.prisma.companyOnboarding.update({
      where: { token },
      data: {
        companyName: data.companyName,
        size: data.size,
        division: data.division,
        location: data.location,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        logoUrl: data.logoUrl,
        govDocUrls: encryptedGovDocUrls,
        faceScanData: data.faceScanData,
        signatureUrl: encryptedSignatureUrl,
        docVerificationScore,
        status: nextStatus,
      },
    });
  }

  async approveSubmission(id: string): Promise<any> {
    const onboarding = await this.prisma.companyOnboarding.findUnique({
      where: { id },
    });

    if (
      !onboarding ||
      (onboarding.status !== "SUBMITTED" && onboarding.status !== "AUTO_VERIFIED")
    ) {
      throw new BadRequestError("Invalid onboarding status for approval");
    }

    // 1. Generate MoU PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    page.drawText("Memorandum of Understanding", { x: 50, y: height - 50, size: 20, font });
    page.drawText(`Company: ${onboarding.companyName}`, { x: 50, y: height - 100, size: 12, font });
    page.drawText(`Representative: ${onboarding.adminName}`, {
      x: 50,
      y: height - 130,
      size: 12,
      font,
    });
    page.drawText(`Location: ${onboarding.location}`, { x: 50, y: height - 160, size: 12, font });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 190,
      size: 12,
      font,
    });

    const sigUrl = onboarding.signatureUrl;
    if (sigUrl && sigUrl.startsWith("data:image/png;base64,")) {
      const signatureBytes = Buffer.from(sigUrl.split(",")[1] as string, "base64");
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      page.drawImage(signatureImage, { x: 50, y: height - 300, width: 200, height: 50 });
      page.drawText("Signed (Digital Signature)", { x: 50, y: height - 320, size: 10, font });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    const mouUrl = `data:application/pdf;base64,${pdfBase64}`;

    // 2. Transaction
    return await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: onboarding.companyName || "Unknown",
          slug:
            onboarding.companyName?.toLowerCase().replace(/[\s_]+/g, "-") +
            "-" +
            uuidv4().substring(0, 8),
          status: "ACTIVE",
          ekycStatus: "VERIFIED_MANUAL",
          location: onboarding.location,
          industry: onboarding.division,
          logoUrl: onboarding.logoUrl,
        },
      });

      // Hash the default temporary password. forcePasswordChange ensures the
      // user must set a new password on first login before accessing the platform.
      const tempPasswordHash = await bcrypt.hash(EKYC_DEFAULT_PASSWORD, config.BCRYPT_ROUNDS);

      const user = await tx.user.create({
        data: {
          email: onboarding.adminEmail || `admin-${uuidv4()}@test.com`,
          firstName: onboarding.adminName?.split(" ")[0] || "Admin",
          lastName: onboarding.adminName?.split(" ").slice(1).join(" ") || "",
          passwordHash: tempPasswordHash,
          role: "COMPANY_OWNER",
          forcePasswordChange: true,
        },
      });

      await tx.companyMember.create({
        data: {
          companyId: company.id,
          userId: user.id,
          role: "COMPANY_OWNER",
          invitedBy: onboarding.superAdminId,
        },
      });

      await tx.companyOnboarding.update({
        where: { id },
        data: {
          status: "APPROVED",
          mouUrl,
        },
      });

      return { company, user, mouUrl };
    });
  }

  async getAllOnboardings(): Promise<any[]> {
    const onboardings = await this.prisma.companyOnboarding.findMany({
      orderBy: { createdAt: "desc" },
    });
    return onboardings.map((o) => ({
      ...o,
      signatureUrl: o.signatureUrl ? EncryptionService.decrypt(o.signatureUrl) : null,
      govDocUrls: Array.isArray(o.govDocUrls)
        ? o.govDocUrls.map((url) => EncryptionService.decrypt(url as string))
        : [],
    }));
  }
}
