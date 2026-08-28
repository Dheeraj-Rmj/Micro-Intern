import type { IAdminRepository, UserSummary, CompanySummary } from "../../application/index.js";
import type { PlatformStatsProps } from "../../domain/index.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@microintern/database";
import { ConflictError } from "@/shared/errors/index.js";

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
            company: {
              include: {
                assessments: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        devices: {
          orderBy: { lastSeenAt: "desc" },
          take: 1,
        },
      },
    });

    return users.map((u) => {
      const company = u.companyMembership?.[0]?.company;
      return {
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
            ? `Company: ${company?.name ?? "Unassigned"}`
            : `Bio: ${u.candidateProfile?.bio ?? "No bio"}`,
        ipAddress: u.devices?.[0]?.ipAddress ?? "Unknown IP",
        companyName: company?.name,
        activeTrials: company?.assessments?.length ?? 0,
        escrowLocked: company?.assessments?.reduce((acc: number, curr: any) => acc + (curr.passingScore || 0) * 10, 0) ?? 0,
      };
    });
  }

  async createCompanyManually(data: { companyName: string; adminEmail: string; adminName: string }): Promise<any> {
    // ── Pre-checks (give friendly errors instead of raw Prisma P2002) ──────
    const existingUser = await this.db.user.findUnique({ where: { email: data.adminEmail } });
    if (existingUser) {
      throw new ConflictError(
        `A user with email "${data.adminEmail}" already exists. Use a different email address.`,
        "COMPANY_ALREADY_EXISTS",
      );
    }

    const slug = data.companyName.toLowerCase().replace(/[\s_]+/g, "-") + "-" + crypto.randomUUID().substring(0, 8);
    
    return await this.db.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);
      const user = await tx.user.create({
        data: {
          email: data.adminEmail,
          firstName: data.adminName.split(" ")[0] || "Admin",
          lastName: data.adminName.split(" ").slice(1).join(" ") || "",
          passwordHash: hashedPassword, 
          role: "COMPANY_OWNER",
          forcePasswordChange: true,
        },
      });

      // 2. Create Company
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          slug,
          status: "ACTIVE",
          ekycStatus: "VERIFIED_MANUAL",
        },
      });

      // 3. Create Company Member
      await tx.companyMember.create({
        data: {
          companyId: company.id,
          userId: user.id,
          role: "COMPANY_OWNER",
        },
      });

      return { user, company };
    });
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
    const activeCount = await this.db.assessment.count({
      where: { status: "PUBLISHED" as any, deletedAt: null },
    });
    const pendingCount = await this.db.submission.count({
      where: { status: "SUBMITTED" as any, deletedAt: null },
    });

    return {
      totalValueLocked: 0,
      activeContracts: activeCount,
      payoutsPending: 0,
    };
  }

  async getSubscriptionMetrics(): Promise<any> {
    const activeCompanies = await this.db.company.count({
      where: { status: "ACTIVE" as any, deletedAt: null },
    });
    return {
      mrr: 0,
      arr: 0,
      activePlans: activeCompanies,
      growthRate: 0,
      plans: [],
    };
  }

  async getPaymentMetrics(): Promise<any> {
    const activeCompanies = await this.db.company.count({
      where: { status: "ACTIVE" as any, deletedAt: null },
    });
    return {
      monthlyVolume: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      refundRate: 0,
      recentPayouts: [],
    };
  }

  async getGlobalAnalytics(): Promise<any> {
    const evalStats = await this.db.evaluation.aggregate({
      _avg: { percentageScore: true },
      where: { deletedAt: null },
    });

    return {
      platformHealthScore: evalStats._avg.percentageScore ?? 0,
      activeUsersGrowth: 0,
      topSkillsDemanded: [],
      skillGaps: [],
    };
  }
}
