import { UnauthorizedError } from '@/shared/errors/index.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type {
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
import type { CreateCompanyInput, UpdateCompanyInput, InviteTeamMemberInput } from '@microintern/shared';
import type { Request, Response, NextFunction } from 'express';

export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getContextCompanyUseCase: GetContextCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly uploadLogoUseCase: UploadLogoUseCase,
    private readonly inviteTeamMemberUseCase: InviteTeamMemberUseCase,
    private readonly listTeamMembersUseCase: ListTeamMembersUseCase,
    private readonly removeTeamMemberUseCase: RemoveTeamMemberUseCase,
    private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
    private readonly getHiringAnalyticsUseCase: GetHiringAnalyticsUseCase,
    private readonly getBillingUseCase: GetBillingUseCase,
    private readonly getAIInsightsUseCase: GetAIInsightsUseCase,
    private readonly listCompanySubmissionsUseCase: ListCompanySubmissionsUseCase,
  ) {}

  private getAuthenticatedUserId(req: Request): string {
    const user = req.user as { id?: string } | undefined;
    if (user?.id === undefined || typeof user.id !== 'string') {
      throw new UnauthorizedError('Authentication required to access company profile');
    }
    return user.id;
  }

  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const input = req.body as CreateCompanyInput;
      const result = await this.createCompanyUseCase.execute(userId, input);
      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  getContextCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const result = await this.getContextCompanyUseCase.execute(userId);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const input = req.body as UpdateCompanyInput;
      const result = await this.updateCompanyUseCase.execute(userId, input);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const file = req.file;
      const result = await this.uploadLogoUseCase.execute(userId, file);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const page = typeof req.query['page'] === 'string' ? parseInt(req.query['page'], 10) : undefined;
      const limit = typeof req.query['limit'] === 'string' ? parseInt(req.query['limit'], 10) : undefined;
      const { members, pagination } = await this.listTeamMembersUseCase.execute(userId, { page, limit });
      ResponseFormatter.paginated(res, members, pagination);
    } catch (error) {
      next(error);
    }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const { email } = req.body as InviteTeamMemberInput;
      const result = await this.inviteTeamMemberUseCase.execute(userId, email);
      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const rawId = req.params['userId'];
      const targetUserId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (targetUserId === undefined) {
        throw new Error('User ID parameter is required');
      }
      await this.removeTeamMemberUseCase.execute(userId, targetUserId);
      ResponseFormatter.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const company = await this.getContextCompanyUseCase.execute(userId);
      const result = await this.getDepartmentsUseCase.execute(company.id);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getHiringAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const company = await this.getContextCompanyUseCase.execute(userId);
      const result = await this.getHiringAnalyticsUseCase.execute(company.id);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getBilling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const company = await this.getContextCompanyUseCase.execute(userId);
      const result = await this.getBillingUseCase.execute(company.id);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getAIInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const company = await this.getContextCompanyUseCase.execute(userId);
      const result = await this.getAIInsightsUseCase.execute(company.id);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  listSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const company = await this.getContextCompanyUseCase.execute(userId);
      const { submissions, pagination } = await this.listCompanySubmissionsUseCase.execute(company.id, req.query);
      ResponseFormatter.paginated(res, submissions, pagination);
    } catch (error) {
      next(error);
    }
  };
}
