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

  async listUsers(filters: { search?: string; role?: string }): Promise<any[]> {
    const where: any = { deletedAt: null };
    if (filters.role && filters.role !== "all") {
      where.role = filters.role.toUpperCase() as any;
    }
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await this.db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        candidateProfile: true,
        companyMembership: {
          include: {
            company: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role.toLowerCase(),
      status: u.status.toLowerCase(),
      verified: u.status === "ACTIVE",
      trustScore: u.candidateProfile?.completionPercentage ?? 90,
      joined: u.createdAt.toISOString().split("T")[0],
      details:
        u.role === "COMPANY_OWNER" || u.role === "RECRUITER"
          ? `Company: ${u.companyMembership?.[0]?.company?.name ?? "Unassigned"}`
          : `Bio: ${u.candidateProfile?.bio ?? "No bio"}`,
    }));
  }

  async listTrials(filters: { search?: string; status?: string }): Promise<any[]> {
    const where: any = { deletedAt: null };

    const submissions = await this.db.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assessment: {
          include: {
            company: true,
          },
        },
        candidate: {
          include: {
            user: true,
          },
        },
      },
    });

    return submissions.map((s) => {
      let escrowStatus = "LOCKED";
      if (s.status === "EVALUATION_COMPLETE" || s.status === "PASSED") escrowStatus = "RELEASED";
      else if (s.status === "UNDER_EVALUATION" || s.status === "SUBMITTED")
        escrowStatus = "REVIEW_PENDING";

      return {
        id: s.id,
        title: s.assessment.title,
        company: s.assessment.company.name,
        stipend: `$${s.assessment.passingScore * 10}`,
        candidate: `${s.candidate.user.firstName} ${s.candidate.user.lastName}`,
        escrowStatus,
        aiScore: s.totalScore ?? 80,
        submittedAt: s.submittedAt
          ? s.submittedAt.toISOString().split("T")[0]
          : s.createdAt.toISOString().split("T")[0],
        category: s.assessment.skillsRequired?.[0] ?? "Engineering",
      };
    });
  }

  async listAuditLogs(filters: { search?: string; severity?: string }): Promise<any[]> {
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: "insensitive" } },
        { entityType: { contains: filters.search, mode: "insensitive" } },
        { userAgent: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const logs = await this.db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: true,
      },
    });

    return logs.map((l) => ({
      id: l.id,
      time: l.createdAt.toLocaleTimeString(),
      actor: l.actor ? `${l.actor.firstName} ${l.actor.lastName}` : "System",
      ip: l.ipAddress ?? "127.0.0.1",
      action: l.action,
      severity: l.action.includes("SUSPEND") || l.action.includes("DELETE") ? "CRITICAL" : "INFO",
      details: `${l.action} event on ${l.entityType} (${l.entityId ?? "N/A"})`,
    }));
  }

  async getEscrowMetrics(): Promise<any> {
    // In a real app we would sum actual transaction records. Here we estimate based on active assessments.
    const activeCount = await this.db.assessment.count({
      where: { status: "PUBLISHED" as any, deletedAt: null },
    });
    const pendingCount = await this.db.submission.count({
      where: { status: "SUBMITTED" as any, deletedAt: null },
    });

    return {
      totalValueLocked: activeCount * 1500 + pendingCount * 500,
      activeContracts: activeCount,
      payoutsPending: pendingCount * 1500,
    };
  }

  async getSubscriptionMetrics(): Promise<any> {
    const activeCompanies = await this.db.company.count({
      where: { status: "ACTIVE" as any, deletedAt: null },
    });
    // Simulate metrics based on company count
    return {
      mrr: activeCompanies * 299,
      arr: activeCompanies * 299 * 12,
      activePlans: activeCompanies,
      growthRate: 14.5,
      plans: [
        { name: "Enterprise Plus", count: Math.floor(activeCompanies * 0.2), price: 999 },
        { name: "Pro", count: Math.floor(activeCompanies * 0.5), price: 299 },
        { name: "Starter", count: Math.floor(activeCompanies * 0.3), price: 49 },
      ],
    };
  }

  async getPaymentMetrics(): Promise<any> {
    const activeCompanies = await this.db.company.count({
      where: { status: "ACTIVE" as any, deletedAt: null },
    });
    return {
      monthlyVolume: activeCompanies * 450,
      successfulTransactions: activeCompanies * 12,
      failedTransactions: Math.floor(activeCompanies * 0.5),
      refundRate: 1.2,
      recentPayouts: [
        { id: "po_123", amount: 4500, status: "paid", date: new Date().toISOString() },
        { id: "po_124", amount: 1200, status: "pending", date: new Date().toISOString() },
      ],
    };
  }

  async getGlobalAnalytics(): Promise<any> {
    const evalStats = await this.db.evaluation.aggregate({
      _avg: { percentageScore: true },
      where: { deletedAt: null },
    });

    return {
      platformHealthScore: evalStats._avg.percentageScore ?? 92,
      activeUsersGrowth: 18.4,
      topSkillsDemanded: [
        { skill: "React", demandIndex: 98, trend: "up" },
        { skill: "Kubernetes", demandIndex: 85, trend: "up" },
        { skill: "Python", demandIndex: 92, trend: "stable" },
      ],
      skillGaps: [
        { skill: "Rust", severity: "Critical", impact: "High-performance systems" },
        { skill: "GraphQL", severity: "High", impact: "API Layer" },
      ],
    };
  }
}
