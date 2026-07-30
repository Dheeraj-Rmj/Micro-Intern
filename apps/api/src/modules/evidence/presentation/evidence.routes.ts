import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { PrismaEvidenceRepository } from '../infrastructure/PrismaEvidenceRepository.js';
import { EvidenceService } from '../application/EvidenceService.js';
import { EvidenceController } from './evidence.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

export function registerEvidenceModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get('IEvidenceRepository');
  } catch {
    container.register('IEvidenceRepository', (infra: InfrastructureDependencies) => {
      return new PrismaEvidenceRepository(infra.db);
    });

    container.register('EvidenceService', () => {
      return new EvidenceService(container.get('IEvidenceRepository'));
    });

    container.register('EvidenceController', () => {
      return new EvidenceController(container.get('EvidenceService'));
    });
  }
}

export function createEvidenceRoutes(): Router {
  registerEvidenceModuleDependencies();
  const container = getContainer();
  const controller = container.get<EvidenceController>('EvidenceController');

  const router = Router();

  router.post('/', authMiddleware, controller.registerEvidence);
  router.get('/:id', authMiddleware, controller.getEvidence);
  router.put('/:id/verify', authMiddleware, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]), controller.verifyEvidence);
  router.get('/candidate/:candidateId', authMiddleware, controller.listCandidateEvidence);
  router.get('/submission/:submissionId', authMiddleware, controller.listSubmissionEvidence);
  router.post('/:id/skills', authMiddleware, controller.linkSkill);
  router.post('/:id/competencies', authMiddleware, controller.linkCompetency);

  return router;
}
