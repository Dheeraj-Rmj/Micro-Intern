import type { PlatformStatsProps } from '../../domain/entities/PlatformStats.entity.js';

export interface UserSummary {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
}

export interface IAdminRepository {
  getPlatformStatsProps(): Promise<PlatformStatsProps>;
  findCompanyById(companyId: string): Promise<CompanySummary | null>;
  updateCompanyStatus(companyId: string, status: string): Promise<CompanySummary>;
  listPendingCompanies(): Promise<CompanySummary[]>;
  findUserById(userId: string): Promise<UserSummary | null>;
  updateUserStatus(userId: string, status: string): Promise<UserSummary>;
  listUsers(filters: { search?: string; role?: string }): Promise<any[]>;
  listTrials(filters: { search?: string; status?: string }): Promise<any[]>;
  listAuditLogs(filters: { search?: string; severity?: string }): Promise<any[]>;
  getEscrowMetrics(): Promise<any>;
  getSubscriptionMetrics(): Promise<any>;
  getPaymentMetrics(): Promise<any>;
  getGlobalAnalytics(): Promise<any>;
}

