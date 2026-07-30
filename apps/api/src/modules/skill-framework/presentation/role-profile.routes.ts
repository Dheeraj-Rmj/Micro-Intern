import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { PrismaRoleProfileRepository } from '../infrastructure/PrismaRoleProfileRepository.js';
import { RoleProfileService } from '../application/RoleProfileService.js';
import { RoleProfileController } from './role-profile.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

export function registerRoleProfileModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get('IRoleProfileRepository');
  } catch {
    container.register('IRoleProfileRepository', (infra: InfrastructureDependencies) => {
      return new PrismaRoleProfileRepository(infra.db);
    });

    container.register('RoleProfileService', () => {
      return new RoleProfileService(container.get('IRoleProfileRepository'));
    });

    container.register('RoleProfileController', () => {
      return new RoleProfileController(container.get('RoleProfileService'));
    });
  }
}

export function createRoleProfileRoutes(): Router {
  registerRoleProfileModuleDependencies();
  const container = getContainer();
  const controller = container.get<RoleProfileController>('RoleProfileController');

  const router = Router();

  router.post('/', authMiddleware, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]), controller.createRoleProfile);
  router.get('/:id', authMiddleware, controller.getRoleProfile);
  router.get('/company/:companyId', authMiddleware, controller.listCompanyRoleProfiles);

  router.post('/:id/skills', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.SUPER_ADMIN, Role.ADMIN]), controller.addRequiredSkill);
  router.post('/:id/competencies', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.SUPER_ADMIN, Role.ADMIN]), controller.addRequiredCompetency);
  router.post('/:id/evaluate', authMiddleware, requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.SUPER_ADMIN, Role.ADMIN]), controller.evaluateCandidate);

  return router;
}
