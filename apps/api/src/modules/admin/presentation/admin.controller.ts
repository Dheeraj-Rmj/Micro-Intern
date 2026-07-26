import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type {
  GetPlatformStatsUseCase,
  ListPendingCompaniesUseCase,
  VerifyCompanyUseCase,
  SuspendUserUseCase,
} from '../application/index.js';
import type { Request, Response, NextFunction } from 'express';

export class AdminController {
  constructor(
    private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
    private readonly listPendingCompaniesUseCase: ListPendingCompaniesUseCase,
    private readonly verifyCompanyUseCase: VerifyCompanyUseCase,
    private readonly suspendUserUseCase: SuspendUserUseCase
  ) {}

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const stats = await this.getPlatformStatsUseCase.execute();
    ResponseFormatter.success(res, stats);
  }

  async listPendingCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    const companies = await this.listPendingCompaniesUseCase.execute();
    ResponseFormatter.success(res, companies);
  }

  async verifyCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    const companyId = req.params['id'] as string;
    const verified = await this.verifyCompanyUseCase.execute(req.user!.id, companyId);
    ResponseFormatter.success(res, verified);
  }

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const targetUserId = req.params['id'] as string;
    const suspended = await this.suspendUserUseCase.execute(req.user!.id, targetUserId);
    ResponseFormatter.success(res, suspended);
  }
}
