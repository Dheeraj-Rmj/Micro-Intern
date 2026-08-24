import { Router } from 'express';
import express from 'express';
import { EkycController } from './ekyc.controller.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';

import { prisma } from '@/core/database.js';
import { EkycUseCase } from '../application/use-cases/ekyc.usecase.js';

export function createEkycRouter(): Router {
  const router = Router();
  
  const ekycUseCase = new EkycUseCase(prisma as any);
  const ekycController = new EkycController(ekycUseCase);

  // Webhooks MUST use express.raw to preserve the raw body for signature verification.
  // We apply it specifically to this route before the global body parser if possible,
  // or configure it in the main app.js to handle /webhook routes with raw parser.
  router.post(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
    ekycController.handleStripeWebhook.bind(ekycController)
  );

  // Authenticated endpoints
  router.use(authMiddleware);

  router.post(
    '/stripe/session',
    ekycController.createStripeSession.bind(ekycController)
  );

  router.post(
    '/manual/upload',
    ekycController.uploadManualDocuments.bind(ekycController)
  );

  router.post(
    '/manual/approve/:companyId',
    ekycController.approveManualVerification.bind(ekycController)
  );

  return router;
}
