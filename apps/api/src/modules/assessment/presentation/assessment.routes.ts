import { Role, AuditAction } from '@microintern/shared';
import { Router } from 'express';

import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware, optionalAuthMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';

import { CreateAssessmentUseCase } from '../application/use-cases/create-assessment.usecase.js';
import { GetAssessmentDetailsUseCase } from '../application/use-cases/get-assessment-details.usecase.js';
import { ListCompanyAssessmentsUseCase } from '../application/use-cases/list-company-assessments.usecase.js';
import { ListPublicAssessmentsUseCase } from '../application/use-cases/list-public-assessments.usecase.js';
import { PublishAssessmentUseCase } from '../application/use-cases/publish-assessment.usecase.js';
import { UpdateAssessmentUseCase } from '../application/use-cases/update-assessment.usecase.js';
import { DuplicateAssessmentUseCase } from '../application/use-cases/duplicate-assessment.usecase.js';
import { ArchiveAssessmentUseCase } from '../application/use-cases/archive-assessment.usecase.js';
import { DeleteAssessmentUseCase } from '../application/use-cases/delete-assessment.usecase.js';
import {
  CreateAssessmentVersionUseCase,
  ListAssessmentVersionsUseCase,
  RestoreAssessmentVersionUseCase,
} from '../application/use-cases/assessment-versioning.usecase.js';
import {
  SaveAsTemplateUseCase,
  ListTemplatesUseCase,
} from '../application/use-cases/assessment-templates.usecase.js';
import { GetAssessmentAnalyticsUseCase } from '../application/use-cases/get-assessment-analytics.usecase.js';
import { GenerateMicroTasksUseCase } from '../application/use-cases/generate-micro-tasks.usecase.js';
import { PrismaAssessmentRepository } from '../infrastructure/repositories/PrismaAssessmentRepository.js';

import { AssessmentController } from './assessment.controller.js';
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  ListPublicAssessmentsQuerySchema,
  CreateVersionSchema,
  RestoreVersionSchema,
  SaveAsTemplateSchema,
  AIJobRequestSchema,
  GenerateMicroTasksSchema,
} from './assessment.schemas.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { RequestHandler } from 'express';

export function registerAssessmentModuleDependencies(): void {
  const container = getContainer();
  try {
    container.get('IAssessmentRepository');
  } catch {
    container.register('IAssessmentRepository', (_infra: InfrastructureDependencies) => new PrismaAssessmentRepository(_infra.db));
    container.register('CreateAssessmentUseCase', () => new CreateAssessmentUseCase(container.get('IAssessmentRepository'), container.get('ICompanyRepository')));
    container.register('UpdateAssessmentUseCase', () => new UpdateAssessmentUseCase(container.get('IAssessmentRepository'), container.get('ICompanyRepository')));
    container.register('PublishAssessmentUseCase', () => new PublishAssessmentUseCase(container.get('IAssessmentRepository'), container.get('ICompanyRepository')));
    container.register('ListCompanyAssessmentsUseCase', () => new ListCompanyAssessmentsUseCase(container.get('IAssessmentRepository'), container.get('ICompanyRepository')));
    container.register('ListPublicAssessmentsUseCase', () => new ListPublicAssessmentsUseCase(container.get('IAssessmentRepository')));
    container.register('GetAssessmentDetailsUseCase', () => new GetAssessmentDetailsUseCase(container.get('IAssessmentRepository'), container.get('ICompanyRepository')));
    container.register('DuplicateAssessmentUseCase', () => new DuplicateAssessmentUseCase(container.get('IAssessmentRepository')));
    container.register('ArchiveAssessmentUseCase', () => new ArchiveAssessmentUseCase(container.get('IAssessmentRepository')));
    container.register('DeleteAssessmentUseCase', () => new DeleteAssessmentUseCase(container.get('IAssessmentRepository')));
    container.register('CreateAssessmentVersionUseCase', () => new CreateAssessmentVersionUseCase(container.get('IAssessmentRepository')));
    container.register('ListAssessmentVersionsUseCase', () => new ListAssessmentVersionsUseCase(container.get('IAssessmentRepository')));
    container.register('RestoreAssessmentVersionUseCase', () => new RestoreAssessmentVersionUseCase(container.get('IAssessmentRepository')));
    container.register('SaveAsTemplateUseCase', () => new SaveAsTemplateUseCase(container.get('IAssessmentRepository')));
    container.register('ListTemplatesUseCase', () => new ListTemplatesUseCase(container.get('IAssessmentRepository')));
    container.register('GetAssessmentAnalyticsUseCase', () => new GetAssessmentAnalyticsUseCase(container.get('IAssessmentRepository')));
    container.register('GenerateMicroTasksUseCase', () => new GenerateMicroTasksUseCase(
      container.get('AIFallbackEngine'),
      container.get('IAssessmentRepository')
    ));
    container.register('AssessmentController', () => new AssessmentController(
      container.get('CreateAssessmentUseCase'),
      container.get('UpdateAssessmentUseCase'),
      container.get('PublishAssessmentUseCase'),
      container.get('ListPublicAssessmentsUseCase'),
      container.get('GetAssessmentDetailsUseCase'),
      container.get('DuplicateAssessmentUseCase'),
      container.get('ArchiveAssessmentUseCase'),
      container.get('DeleteAssessmentUseCase'),
      container.get('CreateAssessmentVersionUseCase'),
      container.get('ListAssessmentVersionsUseCase'),
      container.get('RestoreAssessmentVersionUseCase'),
      container.get('SaveAsTemplateUseCase'),
      container.get('ListTemplatesUseCase'),
      container.get('GetAssessmentAnalyticsUseCase'),
      container.get('GenerateMicroTasksUseCase')
    ));
  }
}

export function createAssessmentRouter(): Router {
  registerAssessmentModuleDependencies();
  const container = getContainer();
  const controller = container.get<AssessmentController>('AssessmentController');
  const router = Router();

  // GET /api/v1/assessments/templates - List reusable assessment templates (Global or Company-scoped)
  router.get(
    '/templates',
    optionalAuthMiddleware as unknown as RequestHandler,
    (req, res, next) => { controller.listTemplates(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments - Create draft assessment assessment
  router.post(
    '/',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', CreateAssessmentSchema),
    audit(AuditAction.CREATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.createAssessment(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/generate-micro-tasks - Generate Micro-Tasks from AI
  router.post(
    '/generate-micro-tasks',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', GenerateMicroTasksSchema),
    audit(AuditAction.CREATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.generateMicroTasks(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments - List public open marketplace assessment assessments
  router.get(
    '/',
    validate('query', ListPublicAssessmentsQuerySchema),
    (req, res, next) => { controller.listPublicAssessments(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id - Get assessment details by id or slug
  router.get(
    ('/:id' as unknown) as string,
    optionalAuthMiddleware as unknown as RequestHandler,
    (req, res, next) => { controller.getAssessmentDetails(req, res, next).catch(next); }
  );

  // PUT /api/v1/assessments/:id - Update assessment & tasks
  router.put(
    ('/:id' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', UpdateAssessmentSchema),
    audit(AuditAction.UPDATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.updateAssessment(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/publish - Publish assessment assessment
  router.post(
    ('/:id/publish' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    audit(AuditAction.UPDATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.publishAssessment(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/duplicate - Duplicate assessment
  router.post(
    ('/:id/duplicate' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    audit(AuditAction.CREATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.duplicateAssessment(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/archive - Archive assessment
  router.post(
    ('/:id/archive' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    audit(AuditAction.UPDATE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.archiveAssessment(req, res, next).catch(next); }
  );

  // DELETE /api/v1/assessments/:id - Soft-delete assessment
  router.delete(
    ('/:id' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    audit(AuditAction.DELETE, 'Assessment') as RequestHandler,
    (req, res, next) => { controller.deleteAssessment(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/validate - 10-point Pre-publish check
  router.get(
    ('/:id/validate' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.validateAssessment(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/ai - Trigger asynchronous AI assistant job
  router.post(
    ('/:id/ai' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', AIJobRequestSchema),
    (req, res, next) => { controller.triggerAIJob(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/versions - Create version snapshot
  router.post(
    ('/:id/versions' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', CreateVersionSchema),
    (req, res, next) => { controller.createVersion(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/versions - List version snapshots
  router.get(
    ('/:id/versions' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.listVersions(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/versions/restore - Restore version snapshot
  router.post(
    ('/:id/versions/restore' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', RestoreVersionSchema),
    (req, res, next) => { controller.restoreVersion(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/template - Save assessment as reusable template
  router.post(
    ('/:id/template' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    validate('body', SaveAsTemplateSchema),
    (req, res, next) => { controller.saveAsTemplate(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/analytics - Get assessment analytics metrics
  router.get(
    ('/:id/analytics' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getAnalytics(req, res, next).catch(next); }
  );

  // ============================================================
  // ENTERPRISE ARCHITECTURAL ROUTES
  // ============================================================

  // GET /api/v1/assessments/:id/competencies - Get Competency Matrix percentage breakdown
  router.get(
    ('/:id/competencies' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.getCompetencyMatrix(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/competencies - Map Competency to Assessment
  router.post(
    ('/:id/competencies' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.mapCompetency(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/learning-outcomes - Get Learning Outcomes
  router.get(
    ('/:id/learning-outcomes' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.listLearningOutcomes(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/learning-outcomes - Set Learning Outcomes
  router.post(
    ('/:id/learning-outcomes' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.updateLearningOutcomes(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/:id/learning-outcomes/generate - AI Generate Learning Outcomes
  router.post(
    ('/:id/learning-outcomes/generate' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.generateLearningOutcomes(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/timeline - Enterprise Activity Timeline
  router.get(
    ('/:id/timeline' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.getTimeline(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/resources/list - Reusable Enterprise Resources
  router.get(
    ('/resources/list' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.listResources(req, res, next).catch(next); }
  );

  // POST /api/v1/assessments/resources/create - Create Reusable Enterprise Resource
  router.post(
    ('/resources/create' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.createResource(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/feature-flags/list - AI Capabilities Feature Flags
  router.get(
    ('/feature-flags/list' as unknown) as string,
    authMiddleware as RequestHandler,
    (req, res, next) => { controller.listFeatureFlags(req, res, next).catch(next); }
  );

  // GET /api/v1/assessments/:id/ai-analytics - Token, cost, and latency analytics
  router.get(
    ('/:id/ai-analytics' as unknown) as string,
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN]) as RequestHandler,
    (req, res, next) => { controller.getAIUsageAnalytics(req, res, next).catch(next); }
  );

  return router;
}
