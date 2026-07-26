import { Role, AuditAction } from '@microintern/shared';


import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { registerTrialModuleDependencies } from '@/modules/trial/presentation/trial.routes.js';

import { GetTrialPipelineUseCase, MoveCandidateUseCase, RejectCandidateUseCase } from '../application/index.js';
import { PrismaPipelineRepository, registerPipelineEventListeners } from '../infrastructure/index.js';

import { PipelineController } from './pipeline.controller.js';
import { MoveCandidateSchema, RejectCandidateSchema } from './pipeline.schemas.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { Router , RequestHandler } from 'express';

export function registerPipelineModuleDependencies(): void {
  const container = getContainer();

  // Ensure Trial dependencies are available
  try {
    container.get('ITrialRepository');
  } catch {
    registerTrialModuleDependencies();
  }

  try {
    container.get('IPipelineRepository');
  } catch {
    container.register('IPipelineRepository', (_infra: InfrastructureDependencies) => new PrismaPipelineRepository(_infra.db));

    container.register('GetTrialPipelineUseCase', () => new GetTrialPipelineUseCase(
      container.get('IPipelineRepository'),
      container.get('ITrialRepository'),
      container.get('ICompanyRepository')
    ));

    container.register('MoveCandidateUseCase', () => new MoveCandidateUseCase(
      container.get('IPipelineRepository'),
      container.get('ICompanyRepository')
    ));

    container.register('RejectCandidateUseCase', () => new RejectCandidateUseCase(
      container.get('IPipelineRepository'),
      container.get('ICompanyRepository')
    ));

    container.register('PipelineController', () => new PipelineController(
      container.get('GetTrialPipelineUseCase'),
      container.get('MoveCandidateUseCase'),
      container.get('RejectCandidateUseCase')
    ));

    // Register EventBus subscriptions
    registerPipelineEventListeners();
  }
}

export function attachCompanyPipelineRoutes(companyRouter: Router): void {
  registerPipelineModuleDependencies();
  const container = getContainer();
  const controller = container.get<PipelineController>('PipelineController');

  // GET /api/v1/companies/me/trials/:trialId/pipeline
  companyRouter.get(
    ('/me/trials/:trialId/pipeline' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getTrialPipeline(req, res, next).catch(next); }
  );

  // PATCH /api/v1/companies/me/pipeline/entries/:entryId
  companyRouter.patch(
    ('/me/pipeline/entries/:entryId' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', MoveCandidateSchema),
    audit(AuditAction.UPDATE, 'PipelineEntry') as RequestHandler,
    (req, res, next) => { controller.moveCandidate(req, res, next).catch(next); }
  );

  // PATCH /api/v1/companies/me/pipeline/entries/:entryId/reject
  companyRouter.patch(
    ('/me/pipeline/entries/:entryId/reject' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', RejectCandidateSchema),
    audit(AuditAction.UPDATE, 'PipelineEntry') as RequestHandler,
    (req, res, next) => { controller.rejectCandidate(req, res, next).catch(next); }
  );
}
