import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { ReferralService } from '../application/ReferralService.js';
import { ReferralController } from './referral.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

function registerReferralDeps(): void {
  const container = getContainer();
  try { container.get('ReferralService'); } catch {
    container.register('ReferralService', (infra: InfrastructureDependencies) =>
      new ReferralService(infra.db),
    );
    container.register('ReferralController', () =>
      new ReferralController(container.get('ReferralService')),
    );
  }
}

export function createReferralRoutes(): Router {
  registerReferralDeps();
  const container = getContainer();
  const ctrl = container.get<ReferralController>('ReferralController');
  const router = Router();

  router.post('/generate', authMiddleware, ctrl.generateCode);
  router.post('/convert', authMiddleware, ctrl.trackConversion);
  router.get('/mine', authMiddleware, ctrl.myReferrals);
  router.get('/stats', authMiddleware, ctrl.myStats);

  return router;
}
