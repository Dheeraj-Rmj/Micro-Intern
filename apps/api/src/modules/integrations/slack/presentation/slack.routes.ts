import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { SlackService } from '../SlackService.js';
import { SlackController } from './slack.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

function registerSlackDeps(): void {
  const container = getContainer();
  try { container.get('SlackService'); } catch {
    container.register('SlackService', (infra: InfrastructureDependencies) =>
      new SlackService(infra.db),
    );
    container.register('SlackController', () =>
      new SlackController(container.get('SlackService')),
    );
  }
}

export function createSlackRoutes(): Router {
  registerSlackDeps();
  const container = getContainer();
  const ctrl = container.get<SlackController>('SlackController');
  const router = Router();

  router.post('/', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.configure);
  router.get('/', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.getIntegration);
  router.delete('/', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.deleteIntegration);

  return router;
}
