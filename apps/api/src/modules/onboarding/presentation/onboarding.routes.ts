import { Router } from 'express';
import { onboardingController } from './onboarding.controller.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole } from '@/middleware/rbac.middleware.js';
import { requireFreshMfa } from '@/middleware/mfa.middleware.js';
import { createRateLimitMiddleware } from '@/middleware/ratelimit.middleware.js';
import { Role } from '@microintern/shared';
import type { RequestHandler } from 'express';

export function createOnboardingRouter(): Router {
  const router = Router();

  // Public/Semi-public routes (Company Admin doing onboarding)
  router.get('/:token', onboardingController.validateToken);
  // Strict rate limit for eKYC submission endpoints to stop automated brute forcing
  const strictLimiter = createRateLimitMiddleware('auth'); 

  router.post('/:token/submit', strictLimiter, onboardingController.submitData);

  // Super Admin routes
  router.post('/admin/generate', authMiddleware as RequestHandler, requireRole(Role.SUPER_ADMIN) as RequestHandler, onboardingController.generateUrl);
  // Require step-up MFA for approval
  router.post('/admin/:id/approve', authMiddleware as RequestHandler, requireRole(Role.SUPER_ADMIN) as RequestHandler, requireFreshMfa as RequestHandler, onboardingController.approveSubmission);
  router.get('/admin/all', authMiddleware as RequestHandler, requireRole(Role.SUPER_ADMIN) as RequestHandler, onboardingController.getAllOnboardings);

  return router;
}
