import type { IAdminRepository, UserSummary, CompanySummary } from "../../application/index.js";
import type { PlatformStatsProps } from "../../domain/index.js";
import type { PrismaClient } from "@microintern/database";

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly db: PrismaClient) {}

  async getPlatformStatsProps(): Promise<PlatformStatsProps> {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      totalAssessments,
      activeAssessments,
      evalStats,
    ] = await Promise.all([
      this.db.user.count({ where: { deletedAt: null } }),
      this.db.user.count({ where: { status: "ACTIVE" as any, deletedAt: null } }),
      this.db.user.count({ where: { status: "SUSPENDED" as any, deletedAt: null } }),
      this.db.company.count({ where: { deletedAt: null } }),
      this.db.company.count({ where: { status: "ACTIVE" as any, deletedAt: null } }),
      this.db.company.count({ where: { status: "PENDING_VERIFICATION" as any, deletedAt: null } }),
      this.db.assessment.count({ where: { deletedAt: null } }),
      this.db.assessment.count({ where: { status: "PUBLISHED" as any, deletedAt: null } }),
      this.db.evaluation.aggregate({
        _count: { id: true },
        _avg: { percentageScore: true },
        where: { deletedAt: null },
      }),
    ]);

    const passedEvaluations = await this.db.evaluation.count({
      where: { isPassed: true, deletedAt: null },
    });

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      totalAssessments,
      activeAssessments,
      aiMetrics: {
        totalEvaluations: evalStats._count.id,
        passedEvaluations,
        averagePercentageScore: evalStats._avg.percentageScore ?? 0,
      },
      timestamp: new Date(),
    };
  }

  async findCompanyById(companyId: string): Promise<CompanySummary | null> {
    const company = await this.db.company.findFirst({
      where: { id: companyId, deletedAt: null },
    });
    if (!company) return null;
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      createdAt: company.createdAt,
    };
  }

  async updateCompanyStatus(companyId: string, status: string): Promise<CompanySummary> {
    const company = await this.db.company.update({
      where: { id: companyId },
      data: { status: status as any },
    });
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      createdAt: company.createdAt,
    };
  }

  async listPendingCompanies(): Promise<CompanySummary[]> {
    const companies = await this.db.company.findMany({
      where: { status: "PENDING_VERIFICATION" as any, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      status: c.status,
      createdAt: c.createdAt,
    }));
  }

  async findUserById(userId: string): Promise<UserSummary | null> {
    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  async updateUserStatus(userId: string, status: string): Promise<UserSummary> {
    const user = await this.db.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
