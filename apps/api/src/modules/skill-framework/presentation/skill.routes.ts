import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { PrismaSkillRepository } from '../infrastructure/PrismaSkillRepository.js';
import { SkillFrameworkService } from '../application/SkillFrameworkService.js';
import { SkillController } from './skill.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

export function registerSkillModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get('ISkillRepository');
  } catch {
    container.register('ISkillRepository', (infra: InfrastructureDependencies) => {
      return new PrismaSkillRepository(infra.db);
    });

    container.register('SkillFrameworkService', () => {
      return new SkillFrameworkService(container.get('ISkillRepository'));
    });

    container.register('SkillController', () => {
      return new SkillController(container.get('SkillFrameworkService'));
    });
  }
}

export function createSkillRoutes(): Router {
  registerSkillModuleDependencies();
  const container = getContainer();
  const controller = container.get<SkillController>('SkillController');

  const router = Router();

  router.get('/categories', controller.listCategories);
  router.post('/categories', authMiddleware, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN]), controller.createCategory);

  router.get('/', controller.listSkills);
  router.post('/', authMiddleware, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.RECRUITER]), controller.createSkill);

  router.get('/:id', controller.getSkill);
  router.get('/:id/graph', controller.getSkillGraph);
  router.post('/link', authMiddleware, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN]), controller.linkSkills);

  return router;
}
