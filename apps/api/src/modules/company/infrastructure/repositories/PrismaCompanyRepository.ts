import { ICompanyRepository } from "../../application/ports/ICompanyRepository.js";
import { CompanyDepartment } from "../../domain/entities/CompanyDepartment.entity.js";
import { CompanyAnalyticsSnapshot } from "../../domain/entities/CompanyAnalyticsSnapshot.entity.js";
import { CompanyBilling } from "../../domain/entities/CompanyBilling.entity.js";
import { AIInsightRecommendation } from "../../domain/entities/AIInsightRecommendation.entity.js";
import { PrismaClient } from "@microintern/database";
import { Company } from "../../domain/entities/Company.entity.js";
import { CompanyMember } from "../../domain/entities/CompanyMember.entity.js";
import type { ICompanyRepository as IDomainCompanyRepository } from "../../domain/repositories/ICompanyRepository.js";

export class PrismaCompanyRepository implements ICompanyRepository, IDomainCompanyRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { id } });
    if (!record) return null;
    return Company.fromPrisma(record as any);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { slug } });
    if (!record) return null;
    return Company.fromPrisma(record as any);
  }

  async findByUserId(userId: string): Promise<Company | null> {
    const member = await this.prisma.companyMember.findFirst({
      where: { userId },
    });
    if (!member) return null;
    const company = await this.prisma.company.findUnique({ where: { id: member.companyId } });
    if (!company) return null;
    return Company.fromPrisma(company as any);
  }

  async create(data: any, slug: string, ownerUserId: string): Promise<Company> {
    const record = await this.prisma.company.create({
      data: {
        name: data.name,
        slug,
        websiteUrl: data.website,
        industry: data.industry,
        size: data.size,
        members: {
          create: {
            userId: ownerUserId,
            role: "COMPANY_OWNER",
          },
        },
      },
    });
    return Company.fromPrisma(record as any);
  }

  async update(companyId: string, data: any): Promise<Company> {
    const record = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        websiteUrl: data.website,
        industry: data.industry,
        size: data.size,
      },
    });
    return Company.fromPrisma(record as any);
  }

  async updateLogo(companyId: string, logoUrl: string): Promise<Company> {
    const record = await this.prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });
    return Company.fromPrisma(record as any);
  }

  async findMember(companyId: string, userId: string): Promise<CompanyMember | null> {
    const record = await this.prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });
    if (!record) return null;
    return CompanyMember.fromPrisma(record as any);
  }

  async findMemberByEmail(companyId: string, email: string): Promise<CompanyMember | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.findMember(companyId, user.id);
  }

  async listMembers(
    companyId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ members: CompanyMember[]; total: number }> {
    const [total, records] = await Promise.all([
      this.prisma.companyMember.count({ where: { companyId } }),
      this.prisma.companyMember.findMany({
        where: { companyId },
        include: { user: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { joinedAt: "desc" },
      }),
    ]);
    const members = records.map((r) => CompanyMember.fromPrisma(r as any));
    return { members, total };
  }

  async inviteMember(
    companyId: string,
    email: string,
    role: string,
    invitedByUserId: string,
  ): Promise<CompanyMember> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    const record = await this.prisma.companyMember.create({
      data: {
        companyId,
        userId: user.id,
        role: role as any,
        invitedBy: invitedByUserId,
      },
    });
    return CompanyMember.fromPrisma(record as any);
  }

  async removeMember(companyId: string, userId: string): Promise<boolean> {
    await this.prisma.companyMember.delete({
      where: { companyId_userId: { companyId, userId } },
    });
    return true;
  }

  async getDepartments(companyId: string): Promise<CompanyDepartment[]> {
    const records = await this.prisma.companyDepartment.findMany({
      where: { companyId },
    });
    return records.map(
      (r) =>
        new CompanyDepartment(
          r.id,
          r.companyId,
          r.name,
          r.headcount,
          r.budget,
          r.status,
          r.createdAt,
          r.updatedAt,
        ),
    );
  }

  async getAnalytics(companyId: string): Promise<CompanyAnalyticsSnapshot | null> {
    const record = await this.prisma.companyAnalyticsSnapshot.findFirst({
      where: { companyId },
      orderBy: { snapshotDate: "desc" },
    });
    if (!record) return null;
    return new CompanyAnalyticsSnapshot(
      record.id,
      record.companyId,
      record.snapshotDate,
      record.timeToHireDays,
      record.offerAcceptanceRate,
      record.candidateDropRate,
      record.totalPlacements,
      record.funnelData,
      record.sourceData,
      record.createdAt,
    );
  }

  async getBilling(companyId: string): Promise<CompanyBilling | null> {
    const record = await this.prisma.companyBilling.findUnique({
      where: { companyId },
    });
    if (!record) return null;
    return new CompanyBilling(
      record.id,
      record.companyId,
      record.stripeCustomerId,
      record.planName,
      record.renewalDate,
      record.recruiterSeatsUsed,
      record.recruiterSeatsMax,
      record.aiCreditsUsed,
      record.aiCreditsMax,
      record.storageUsedBytes,
      record.storageMaxBytes,
      record.createdAt,
      record.updatedAt,
    );
  }

  async getAIInsights(companyId: string): Promise<AIInsightRecommendation[]> {
    const records = await this.prisma.aIInsightRecommendation.findMany({
      where: { companyId, isDismissed: false },
      orderBy: { createdAt: "desc" },
    });
    return records.map(
      (r) =>
        new AIInsightRecommendation(
          r.id,
          r.companyId,
          r.type,
          r.title,
          r.description,
          r.severity,
          r.metadata,
          r.createdAt,
          r.isDismissed,
        ),
    );
  }
}
