import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { WebhookService } from '../application/WebhookService.js';
import { WebhookController } from './webhook.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

function registerWebhookDeps(): void {
  const container = getContainer();
  try { container.get('WebhookService'); } catch {
    container.register('WebhookService', (infra: InfrastructureDependencies) =>
      new WebhookService(infra.db),
    );
    container.register('WebhookController', () =>
      new WebhookController(container.get('WebhookService')),
    );
  }
}

export function createWebhookRoutes(): Router {
  registerWebhookDeps();
  const container = getContainer();
  const ctrl = container.get<WebhookController>('WebhookController');
  const router = Router();

  router.post('/', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.createWebhook);
  router.get('/', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.listWebhooks);
  router.delete('/:id', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.deleteWebhook);
  router.patch('/:id/toggle', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.toggleWebhook);
  router.get('/:id/deliveries', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.getDeliveries);

  return router;
}
