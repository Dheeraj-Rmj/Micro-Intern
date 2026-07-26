import { Role, AuditAction } from '@microintern/shared';
import { Router } from 'express';

import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware, optionalAuthMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';

import { CreateTrialUseCase } from '../application/use-cases/create-trial.usecase.js';
import { GetTrialDetailsUseCase } from '../application/use-cases/get-trial-details.usecase.js';
import { ListCompanyTrialsUseCase } from '../application/use-cases/list-company-trials.usecase.js';
import { ListPublicTrialsUseCase } from '../application/use-cases/list-public-trials.usecase.js';
import { PublishTrialUseCase } from '../application/use-cases/publish-trial.usecase.js';
import { UpdateTrialUseCase } from '../application/use-cases/update-trial.usecase.js';
import { PrismaTrialRepository } from '../infrastructure/repositories/PrismaTrialRepository.js';

import { TrialController } from './trial.controller.js';
import { CreateTrialSchema, UpdateTrialSchema, ListPublicTrialsQuerySchema } from './trial.schemas.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { RequestHandler } from 'express';

export function registerTrialModuleDependencies(): void {
  const container = getContainer();
  try {
    container.get('ITrialRepository');
  } catch {
    container.register('ITrialRepository', (_infra: InfrastructureDependencies) => new PrismaTrialRepository(_infra.db));
    container.register('CreateTrialUseCase', () => new CreateTrialUseCase(container.get('ITrialRepository'), container.get('ICompanyRepository')));
    container.register('UpdateTrialUseCase', () => new UpdateTrialUseCase(container.get('ITrialRepository'), container.get('ICompanyRepository')));
    container.register('PublishTrialUseCase', () => new PublishTrialUseCase(container.get('ITrialRepository'), container.get('ICompanyRepository')));
    container.register('ListCompanyTrialsUseCase', () => new ListCompanyTrialsUseCase(container.get('ITrialRepository'), container.get('ICompanyRepository')));
    container.register('ListPublicTrialsUseCase', () => new ListPublicTrialsUseCase(container.get('ITrialRepository')));
    container.register('GetTrialDetailsUseCase', () => new GetTrialDetailsUseCase(container.get('ITrialRepository'), container.get('ICompanyRepository')));
    container.register('TrialController', () => new TrialController(
      container.get('CreateTrialUseCase'),
      container.get('UpdateTrialUseCase'),
      container.get('PublishTrialUseCase'),
      container.get('ListPublicTrialsUseCase'),
      container.get('GetTrialDetailsUseCase')
    ));
  }
}

export function createTrialRouter(): Router {
  registerTrialModuleDependencies();
  const container = getContainer();
  const controller = container.get<TrialController>('TrialController');
  const router = Router();

  // POST /api/v1/trials - Create draft assessment trial
  router.post(
    '/',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', CreateTrialSchema),
    audit(AuditAction.CREATE, 'Trial') as RequestHandler,
    (req, res, next) => { controller.createTrial(req, res, next).catch(next); }
  );

  // GET /api/v1/trials - List public open marketplace assessment trials
  router.get(
    '/',
    validate('query', ListPublicTrialsQuerySchema),
    (req, res, next) => { controller.listPublicTrials(req, res, next).catch(next); }
  );

  // GET /api/v1/trials/:id - Get trial details by id or slug
  router.get(
    ('/:id' as unknown) as string,
    optionalAuthMiddleware as unknown as RequestHandler,
    (req, res, next) => { controller.getTrialDetails(req, res, next).catch(next); }
  );

  // PUT /api/v1/trials/:id - Update trial & tasks
  router.put(
    ('/:id' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', UpdateTrialSchema),
    audit(AuditAction.UPDATE, 'Trial') as RequestHandler,
    (req, res, next) => { controller.updateTrial(req, res, next).catch(next); }
  );

  // POST /api/v1/trials/:id/publish - Publish assessment trial
  router.post(
    ('/:id/publish' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    audit(AuditAction.UPDATE, 'Trial') as RequestHandler,
    (req, res, next) => { controller.publishTrial(req, res, next).catch(next); }
  );

  return router;
}
