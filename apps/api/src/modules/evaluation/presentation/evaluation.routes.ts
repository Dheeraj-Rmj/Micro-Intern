import { Role, AuditAction } from '@microintern/shared';
import { Router } from 'express';
import multer from 'multer';

import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';
import { registerTrialModuleDependencies } from '@/modules/trial/presentation/trial.routes.js';

import { GetSubmissionEvaluationUseCase } from '../application/use-cases/get-submission-evaluation.usecase.js';
import { ListCandidateSubmissionsUseCase } from '../application/use-cases/list-candidate-submissions.usecase.js';
import { ProcessEvaluationUseCase } from '../application/use-cases/process-evaluation.usecase.js';
import { StartTrialUseCase } from '../application/use-cases/start-trial.usecase.js';
import { SubmitTrialUseCase } from '../application/use-cases/submit-trial.usecase.js';
import { PrismaEvaluationRepository } from '../infrastructure/repositories/PrismaEvaluationRepository.js';
import { PrismaSubmissionRepository } from '../infrastructure/repositories/PrismaSubmissionRepository.js';
import { initAIEvaluationWorker } from '../infrastructure/workers/AIEvaluationWorker.js';

import { EvaluationController } from './evaluation.controller.js';
import { TrialParamSchema, SubmissionParamSchema, PaginationQuerySchema, SubmitTrialBodySchema } from './evaluation.schemas.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { RequestHandler } from 'express';

const uploadSolutions = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file limit for candidate code/diagram solutions
}).array('files');

export function registerEvaluationModuleDependencies(): void {
  const container = getContainer();

  // Ensure Trial dependencies are available
  registerTrialModuleDependencies();

  try {
    container.get('GetProfileUseCase');
  } catch {
    container.register('GetProfileUseCase', (_infra: InfrastructureDependencies) => new GetProfileUseCase(_infra.db));
  }

  try {
    container.get('ISubmissionRepository');
  } catch {
    container.register('ISubmissionRepository', (_infra: InfrastructureDependencies) => new PrismaSubmissionRepository(_infra.db));
    container.register('IEvaluationRepository', (_infra: InfrastructureDependencies) => new PrismaEvaluationRepository(_infra.db));

    container.register('StartTrialUseCase', () => new StartTrialUseCase(
      container.get('ISubmissionRepository'),
      container.get('ITrialRepository'),
      container.get('GetProfileUseCase')
    ));

    container.register('SubmitTrialUseCase', () => new SubmitTrialUseCase(
      container.get('ISubmissionRepository'),
      container.get('GetProfileUseCase')
    ));

    container.register('ProcessEvaluationUseCase', () => new ProcessEvaluationUseCase(
      container.get('ISubmissionRepository'),
      container.get('IEvaluationRepository'),
      container.get('ITrialRepository')
    ));

    container.register('ListCandidateSubmissionsUseCase', () => new ListCandidateSubmissionsUseCase(
      container.get('ISubmissionRepository'),
      container.get('GetProfileUseCase')
    ));

    container.register('GetSubmissionEvaluationUseCase', () => new GetSubmissionEvaluationUseCase(
      container.get('ISubmissionRepository'),
      container.get('IEvaluationRepository'),
      container.get('GetProfileUseCase')
    ));

    container.register('EvaluationController', () => new EvaluationController(
      container.get('StartTrialUseCase'),
      container.get('SubmitTrialUseCase'),
      container.get('ListCandidateSubmissionsUseCase'),
      container.get('GetSubmissionEvaluationUseCase')
    ));
  }

  // Initialize BullMQ worker for evaluation queue
  initAIEvaluationWorker();
}

export function createSubmissionRouter(): Router {
  registerEvaluationModuleDependencies();
  const container = getContainer();
  const controller = container.get<EvaluationController>('EvaluationController');
  const router = Router();

  // GET /api/v1/submissions/me - Candidate's submissions
  router.get(
    '/me',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    validate('query', PaginationQuerySchema),
    (req, res, next) => { controller.listCandidateSubmissions(req, res, next).catch(next); }
  );

  // GET /api/v1/submissions/:id/evaluation - Fetch AI grading results
  router.get(
    ('/:id/evaluation' as unknown) as string,
    authMiddleware as RequestHandler,
    validate('params', SubmissionParamSchema),
    (req, res, next) => { controller.getSubmissionEvaluation(req, res, next).catch(next); }
  );

  return router;
}

export function attachTrialEvaluationRoutes(trialRouter: Router): void {
  registerEvaluationModuleDependencies();
  const container = getContainer();
  const controller = container.get<EvaluationController>('EvaluationController');

  // POST /api/v1/trials/:id/start
  trialRouter.post(
    ('/:id/start' as unknown) as string,
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    validate('params', TrialParamSchema),
    audit(AuditAction.CREATE, 'Submission') as RequestHandler,
    (req, res, next) => { controller.startTrial(req, res, next).catch(next); }
  );

  // POST /api/v1/trials/:id/submit
  trialRouter.post(
    ('/:id/submit' as unknown) as string,
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    uploadSolutions,
    validate('params', TrialParamSchema),
    validate('body', SubmitTrialBodySchema),
    audit(AuditAction.UPDATE, 'Submission') as RequestHandler,
    (req, res, next) => { controller.submitTrial(req, res, next).catch(next); }
  );
}
