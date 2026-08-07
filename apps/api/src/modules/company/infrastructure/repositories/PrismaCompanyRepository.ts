import { ICompanyRepository } from '../../application/ports/ICompanyRepository';
import { CompanyDepartment } from '../../domain/entities/CompanyDepartment.entity';
import { CompanyAnalyticsSnapshot } from '../../domain/entities/CompanyAnalyticsSnapshot.entity';
import { CompanyBilling } from '../../domain/entities/CompanyBilling.entity';
import { AIInsightRecommendation } from '../../domain/entities/AIInsightRecommendation.entity';
import { PrismaClient } from '@microintern/database';

export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private prisma: PrismaClient) {}

  async getDepartments(companyId: string): Promise<CompanyDepartment[]> {
    const records = await this.prisma.companyDepartment.findMany({
      where: { companyId }
    });
    return records.map(r => new CompanyDepartment(
      r.id, r.companyId, r.name, r.headcount, r.budget, r.status, r.createdAt, r.updatedAt
    ));
  }

  async getAnalytics(companyId: string): Promise<CompanyAnalyticsSnapshot | null> {
    const record = await this.prisma.companyAnalyticsSnapshot.findFirst({
      where: { companyId },
      orderBy: { snapshotDate: 'desc' }
    });
    if (!record) return null;
    return new CompanyAnalyticsSnapshot(
      record.id, record.companyId, record.snapshotDate, record.timeToHireDays, record.offerAcceptanceRate,
      record.candidateDropRate, record.totalPlacements, record.funnelData, record.sourceData, record.createdAt
    );
  }

  async getBilling(companyId: string): Promise<CompanyBilling | null> {
    const record = await this.prisma.companyBilling.findUnique({
      where: { companyId }
    });
    if (!record) return null;
    return new CompanyBilling(
      record.id, record.companyId, record.stripeCustomerId, record.planName, record.renewalDate,
      record.recruiterSeatsUsed, record.recruiterSeatsMax, record.aiCreditsUsed, record.aiCreditsMax,
      record.storageUsedBytes, record.storageMaxBytes, record.createdAt, record.updatedAt
    );
  }

  async getAIInsights(companyId: string): Promise<AIInsightRecommendation[]> {
    const records = await this.prisma.aIInsightRecommendation.findMany({
      where: { companyId, isDismissed: false },
      orderBy: { createdAt: 'desc' }
    });
    return records.map(r => new AIInsightRecommendation(
      r.id, r.companyId, r.type, r.title, r.description, r.severity, r.metadata, r.createdAt, r.isDismissed
    ));
  }
}
