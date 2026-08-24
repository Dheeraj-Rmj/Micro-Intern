import { ConfigManager } from "../infrastructure/services/ConfigManager.js";
import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";
import type {
  GetPlatformStatsUseCase,
  ListPendingCompaniesUseCase,
  VerifyCompanyUseCase,
  SuspendUserUseCase,
  ListUsersUseCase,
  ListTrialsUseCase,
  ListAuditLogsUseCase,
  GetEscrowMetricsUseCase,
  GetSubscriptionMetricsUseCase,
  GetPaymentMetricsUseCase,
  GetGlobalAnalyticsUseCase,
} from "../application/index.js";
import type { Request, Response, NextFunction } from "express";

export class AdminController {
  constructor(
    private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
    private readonly listPendingCompaniesUseCase: ListPendingCompaniesUseCase,
    private readonly verifyCompanyUseCase: VerifyCompanyUseCase,
    private readonly suspendUserUseCase: SuspendUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listTrialsUseCase: ListTrialsUseCase,
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
    private readonly getEscrowMetricsUseCase: GetEscrowMetricsUseCase,
    private readonly getSubscriptionMetricsUseCase: GetSubscriptionMetricsUseCase,
    private readonly getPaymentMetricsUseCase: GetPaymentMetricsUseCase,
    private readonly getGlobalAnalyticsUseCase: GetGlobalAnalyticsUseCase,
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
    const companyId = req.params["id"] as string;
    const verified = await this.verifyCompanyUseCase.execute(req.user!.id, companyId);
    ResponseFormatter.success(res, verified);
  }

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const targetUserId = req.params["id"] as string;
    const suspended = await this.suspendUserUseCase.execute(req.user!.id, targetUserId);
    ResponseFormatter.success(res, suspended);
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    const search = req.query["search"] as string | undefined;
    const role = req.query["role"] as string | undefined;
    const users = await this.listUsersUseCase.execute({ search, role });
    ResponseFormatter.success(res, users);
  }

  async listTrials(req: Request, res: Response, next: NextFunction): Promise<void> {
    const search = req.query["search"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const trials = await this.listTrialsUseCase.execute({ search, status });
    ResponseFormatter.success(res, trials);
  }

  async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    const search = req.query["search"] as string | undefined;
    const severity = req.query["severity"] as string | undefined;
    const logs = await this.listAuditLogsUseCase.execute({ search, severity });
    ResponseFormatter.success(res, logs);
  }

  async broadcastAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    const message = req.body.message as string;
    ResponseFormatter.success(res, { broadcasted: true, message });
  }

  async impersonateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const email = req.body.email as string;
    ResponseFormatter.success(res, { impersonating: true, email });
  }

  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    const settings = ConfigManager.getInstance().getConfig();
    ResponseFormatter.success(res, settings);
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    const updated = ConfigManager.getInstance().saveConfig(req.body);
    ResponseFormatter.success(res, updated);
  }

  async getEscrowMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const metrics = await this.getEscrowMetricsUseCase.execute();
    ResponseFormatter.success(res, metrics);
  }

  async getSubscriptionMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const metrics = await this.getSubscriptionMetricsUseCase.execute();
    ResponseFormatter.success(res, metrics);
  }

  async getPaymentMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const metrics = await this.getPaymentMetricsUseCase.execute();
    ResponseFormatter.success(res, metrics);
  }

  async getGlobalAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const metrics = await this.getGlobalAnalyticsUseCase.execute();
    ResponseFormatter.success(res, metrics);
  }
}
