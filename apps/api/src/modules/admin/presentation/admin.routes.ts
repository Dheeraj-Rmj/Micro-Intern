import { Role, AuditAction } from '@microintern/shared';
import { Router } from 'express';

import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole } from '@/middleware/rbac.middleware.js';
import { createAuthRouter } from '@/modules/auth/presentation/auth.routes.js';

import {
  GetPlatformStatsUseCase,
  ListPendingCompaniesUseCase,
  VerifyCompanyUseCase,
  SuspendUserUseCase,
} from '../application/index.js';
import { PrismaAdminRepository } from '../infrastructure/index.js';

import { AdminController } from './admin.controller.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { RequestHandler } from 'express';

export function createAdminRouter(): Router {
  const container = getContainer();

  // Ensure Auth dependencies (such as ISessionService) are registered
  try {
    container.get('ISessionService');
  } catch {
    createAuthRouter();
  }

  try {
    container.get('IAdminRepository');
  } catch {
    container.register('IAdminRepository', (_infra: InfrastructureDependencies) => new PrismaAdminRepository(_infra.db));

    container.register('GetPlatformStatsUseCase', () => new GetPlatformStatsUseCase(container.get('IAdminRepository')));
    container.register('ListPendingCompaniesUseCase', () => new ListPendingCompaniesUseCase(container.get('IAdminRepository')));
    container.register('VerifyCompanyUseCase', () => new VerifyCompanyUseCase(container.get('IAdminRepository')));
    container.register('SuspendUserUseCase', () => new SuspendUserUseCase(
      container.get('IAdminRepository'),
      container.get('ISessionService')
    ));

    container.register('AdminController', () => new AdminController(
      container.get('GetPlatformStatsUseCase'),
      container.get('ListPendingCompaniesUseCase'),
      container.get('VerifyCompanyUseCase'),
      container.get('SuspendUserUseCase')
    ));
  }

  const controller = container.get<AdminController>('AdminController');
  const router = Router();

  // All endpoints in Admin router strictly require ADMIN role or higher (SUPER_ADMIN)
  router.use(authMiddleware as RequestHandler, requireRole(Role.ADMIN) as RequestHandler);

  // GET /api/v1/admin/stats
  router.get(
    '/stats',
    (req, res, next) => { controller.getStats(req, res, next).catch(next); }
  );

  // GET /api/v1/admin/companies/pending
  router.get(
    '/companies/pending',
    (req, res, next) => { controller.listPendingCompanies(req, res, next).catch(next); }
  );

  // POST /api/v1/admin/companies/:id/verify
  router.post(
    ('/companies/:id/verify' as unknown) as string,
    audit(AuditAction.UPDATE, 'Company') as RequestHandler,
    (req, res, next) => { controller.verifyCompany(req, res, next).catch(next); }
  );

  // POST /api/v1/admin/users/:id/suspend
  router.post(
    ('/users/:id/suspend' as unknown) as string,
    audit(AuditAction.UPDATE, 'User') as RequestHandler,
    (req, res, next) => { controller.suspendUser(req, res, next).catch(next); }
  );

  return router;
}
