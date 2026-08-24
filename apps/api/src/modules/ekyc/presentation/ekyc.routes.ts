import { Router } from "express";
import express from "express";
import { EkycController } from "./ekyc.controller.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { requireFreshMfa } from "@/middleware/mfa.middleware.js";
import { createRateLimitMiddleware } from "@/middleware/ratelimit.middleware.js";
import { Role } from "@microintern/shared";

import { prisma } from "@/core/database.js";
import { EkycUseCase } from "../application/use-cases/ekyc.usecase.js";

export function createEkycRouter(): Router {
  const router = Router();

  const ekycUseCase = new EkycUseCase(prisma as any);
  const ekycController = new EkycController(ekycUseCase);

  // Webhooks MUST use express.raw to preserve the raw body for signature verification.
  // We apply it specifically to this route before the global body parser if possible,
  // or configure it in the main app.js to handle /webhook routes with raw parser.
  router.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    ekycController.handleStripeWebhook.bind(ekycController),
  );

  // ---------------------------------------------------------
  // Public Onboarding eKYC Workflow Integration
  // ---------------------------------------------------------
  const strictLimiter = createRateLimitMiddleware("auth");
  router.get("/:token", ekycController.validateToken.bind(ekycController));
  router.post("/:token/submit", strictLimiter, ekycController.submitData.bind(ekycController));

  // Authenticated endpoints
  router.use(authMiddleware);

  router.post("/stripe/session", ekycController.createStripeSession.bind(ekycController));

  router.post("/manual/upload", ekycController.uploadManualDocuments.bind(ekycController));

  router.post(
    "/manual/approve/:companyId",
    ekycController.approveManualVerification.bind(ekycController),
  );

  // Admin routes for eKYC onboarding
  router.post(
    "/admin/:id/approve",
    authMiddleware,
    requireAnyRole([Role.SUPER_ADMIN]),
    requireFreshMfa,
    ekycController.approveSubmission.bind(ekycController),
  );

  router.get(
    "/admin/onboardings",
    authMiddleware,
    requireAnyRole([Role.SUPER_ADMIN]),
    ekycController.getAllOnboardings.bind(ekycController),
  );

  return router;
}
