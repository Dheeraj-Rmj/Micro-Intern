import { Role, AuditAction, CreateCompanySchema, UpdateCompanySchema, InviteTeamMemberSchema } from '@microintern/shared';
import { Router } from 'express';
import multer from 'multer';

import { getContainer } from '@/core/container.js';
import { getStorageService } from '@/infrastructure/storage/StorageService.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole, requireAnyRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { registerAssessmentModuleDependencies } from '@/modules/assessment/presentation/assessment.routes.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import {
  CreateCompanyUseCase,
  GetContextCompanyUseCase,
  UpdateCompanyUseCase,
  UploadLogoUseCase,
  InviteTeamMemberUseCase,
  ListTeamMembersUseCase,
  RemoveTeamMemberUseCase,
  GetDepartmentsUseCase,
  GetHiringAnalyticsUseCase,
  GetBillingUseCase,
  GetAIInsightsUseCase,
  ListCompanySubmissionsUseCase,
} from '../application/index.js';
import { PrismaCompanyRepository, registerCompanyEventListeners } from '../infrastructure/index.js';

import { CompanyController } from './company.controller.js';

import type { InfrastructureDependencies } from '@/core/container.js';
import type { RequestHandler } from 'express';

/**
 * Company router factory.
 * Registers module dependencies lazily and defines company endpoints.
 */
export function createCompanyRouter(): Router {
  const container = getContainer();

  try {
    container.get('ICompanyRepository');
  } catch {
    container.register('ICompanyRepository', (_infra: InfrastructureDependencies) => new PrismaCompanyRepository(_infra.db));
    container.register('CreateCompanyUseCase', () => new CreateCompanyUseCase(container.get('ICompanyRepository')));
    container.register('GetContextCompanyUseCase', () => new GetContextCompanyUseCase(container.get('ICompanyRepository')));
    container.register('UpdateCompanyUseCase', () => new UpdateCompanyUseCase(container.get('ICompanyRepository')));
    container.register('UploadLogoUseCase', () => new UploadLogoUseCase(
      container.get('ICompanyRepository'),
      getStorageService()
    ));
    container.register('InviteTeamMemberUseCase', () => new InviteTeamMemberUseCase(container.get('ICompanyRepository')));
    container.register('ListTeamMembersUseCase', () => new ListTeamMembersUseCase(container.get('ICompanyRepository')));
    container.register('RemoveTeamMemberUseCase', () => new RemoveTeamMemberUseCase(container.get('ICompanyRepository')));
    container.register('GetDepartmentsUseCase', () => new GetDepartmentsUseCase(container.get('ICompanyRepository')));
    container.register('GetHiringAnalyticsUseCase', () => new GetHiringAnalyticsUseCase(container.get('ICompanyRepository')));
    container.register('GetBillingUseCase', () => new GetBillingUseCase(container.get('ICompanyRepository')));
    container.register('GetAIInsightsUseCase', () => new GetAIInsightsUseCase(container.get('ICompanyRepository')));
    container.register('ListCompanySubmissionsUseCase', (_infra: InfrastructureDependencies) => new ListCompanySubmissionsUseCase(_infra.db));
    
    container.register('CompanyController', () => new CompanyController(
      container.get('CreateCompanyUseCase'),
      container.get('GetContextCompanyUseCase'),
      container.get('UpdateCompanyUseCase'),
      container.get('UploadLogoUseCase'),
      container.get('InviteTeamMemberUseCase'),
      container.get('ListTeamMembersUseCase'),
      container.get('RemoveTeamMemberUseCase'),
      container.get('GetDepartmentsUseCase'),
      container.get('GetHiringAnalyticsUseCase'),
      container.get('GetBillingUseCase'),
      container.get('GetAIInsightsUseCase'),
      container.get('ListCompanySubmissionsUseCase')
    ));

    registerCompanyEventListeners();
    registerAssessmentModuleDependencies();
  }

  const controller = container.get<CompanyController>('CompanyController');
  const router = Router();

  const uploadLogo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single('logo');

  // POST /api/v1/companies - Create company
  router.post(
    '/',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    validate('body', CreateCompanySchema),
    audit(AuditAction.CREATE, 'Company') as RequestHandler,
    (req, res, next) => { controller.createCompany(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me - Get context company
  router.get(
    '/me',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getContextCompany(req, res, next).catch(next); },
  );

  // PUT /api/v1/companies/me - Update company profile
  router.put(
    '/me',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    validate('body', UpdateCompanySchema),
    audit(AuditAction.UPDATE, 'Company') as RequestHandler,
    (req, res, next) => { controller.updateCompany(req, res, next).catch(next); },
  );

  // POST /api/v1/companies/me/logo - Upload company branding logo
  router.post(
    '/me/logo',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    uploadLogo,
    audit(AuditAction.UPDATE, 'Company') as RequestHandler,
    (req, res, next) => { controller.uploadLogo(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/assessments - List company assessment assessments
  router.get(
    '/me/assessments',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => {
      const useCase = container.get<any>('ListCompanyAssessmentsUseCase');
      useCase
        .execute(req.user!.id, req.query)
        .then(({ assessments, pagination }: any) => {
          ResponseFormatter.paginated(res, assessments, pagination);
        })
        .catch(next);
    },
  );

  // GET /api/v1/companies/me/assessments/submissions - List submissions for company
  router.get(
    '/me/assessments/submissions',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.listSubmissions(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/members - List team members (Team Management)
  router.get(
    '/me/members',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    (req, res, next) => { controller.listMembers(req, res, next).catch(next); },
  );

  // POST /api/v1/companies/me/members/invite - Invite recruiter (Team Management)
  router.post(
    '/me/members/invite',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    validate('body', InviteTeamMemberSchema),
    audit(AuditAction.INVITATION_SENT, 'CompanyMember') as RequestHandler,
    (req, res, next) => { controller.inviteMember(req, res, next).catch(next); },
  );

  // DELETE /api/v1/companies/me/members/:userId - Remove team member (Team Management)
  router.delete(
    '/me/members/:userId',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    audit(AuditAction.DELETE, 'CompanyMember') as RequestHandler,
    (req, res, next) => { controller.removeMember(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/departments
  router.get(
    '/me/departments',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getDepartments(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/analytics
  router.get(
    '/me/analytics',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getHiringAnalytics(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/billing
  router.get(
    '/me/billing',
    authMiddleware as RequestHandler,
    requireRole(Role.COMPANY_OWNER) as RequestHandler,
    (req, res, next) => { controller.getBilling(req, res, next).catch(next); },
  );

  // GET /api/v1/companies/me/ai-insights
  router.get(
    '/me/ai-insights',
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.RECRUITER]) as RequestHandler,
    (req, res, next) => { controller.getAIInsights(req, res, next).catch(next); },
  );

  return router;
}
