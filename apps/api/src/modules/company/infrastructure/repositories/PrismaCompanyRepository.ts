import { Company } from '../../domain/entities/Company.entity.js';
import { CompanyMember } from '../../domain/entities/CompanyMember.entity.js';

import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { PrismaClient, CompanySize, Role } from '@microintern/database';
import type { CreateCompanyInput, UpdateCompanyInput } from '@microintern/shared';

/**
 * Prisma Company Repository — infrastructure implementation.
 *
 * Implements data operations for companies and team members.
 * Isolates database logic completely from the domain and application layers.
 */
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Company | null> {
    const company = await this.db.company.findFirst({
      where: { id, deletedAt: null },
    });
    return company !== null ? Company.fromPrisma(company) : null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await this.db.company.findFirst({
      where: { slug, deletedAt: null },
    });
    return company !== null ? Company.fromPrisma(company) : null;
  }

  async findByUserId(userId: string): Promise<Company | null> {
    const membership = await this.db.companyMember.findFirst({
      where: { userId, deletedAt: null },
      include: {
        company: true,
      },
    });

    const company = membership?.company;
    if (company == null || company.deletedAt !== null) {
      return null;
    }

    return Company.fromPrisma(company);
  }

  async create(data: CreateCompanyInput, slug: string, ownerUserId: string): Promise<Company> {
    const company = await this.db.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name: data.name,
          slug,
          websiteUrl: data.websiteUrl ?? data.website ?? null,
          description: data.description ?? null,
          industry: data.industry ?? null,
          size: (data.size as CompanySize | undefined) ?? null,
          location: data.location ?? null,
          linkedinUrl: data.linkedinUrl ?? null,
          status: 'ACTIVE',
          planTier: 'FREE',
        },
      });

      // Link creator as COMPANY_OWNER
      await tx.companyMember.create({
        data: {
          companyId: created.id,
          userId: ownerUserId,
          role: 'COMPANY_OWNER',
          joinedAt: new Date(),
        },
      });

      // Ensure user role in Users table is also updated
      await tx.user.update({
        where: { id: ownerUserId },
        data: { role: 'COMPANY_OWNER' },
      });

      return created;
    });

    return Company.fromPrisma(company);
  }

  async update(companyId: string, data: UpdateCompanyInput): Promise<Company> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.websiteUrl !== undefined) updateData['websiteUrl'] = data.websiteUrl;
    else if (data.website !== undefined) updateData['websiteUrl'] = data.website;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.industry !== undefined) updateData['industry'] = data.industry;
    if (data.size !== undefined) updateData['size'] = data.size;
    if (data.location !== undefined) updateData['location'] = data.location;
    if (data.linkedinUrl !== undefined) updateData['linkedinUrl'] = data.linkedinUrl;
    if (data.logoUrl !== undefined) updateData['logoUrl'] = data.logoUrl;

    const updated = await this.db.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return Company.fromPrisma(updated);
  }

  async updateLogo(companyId: string, logoUrl: string): Promise<Company> {
    const updated = await this.db.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });

    return Company.fromPrisma(updated);
  }

  async findMember(companyId: string, userId: string): Promise<CompanyMember | null> {
    const member = await this.db.companyMember.findFirst({
      where: { companyId, userId, deletedAt: null },
      include: { user: true },
    });
    return member !== null ? CompanyMember.fromPrisma(member) : null;
  }

  async findMemberByEmail(companyId: string, email: string): Promise<CompanyMember | null> {
    const member = await this.db.companyMember.findFirst({
      where: {
        companyId,
        deletedAt: null,
        user: {
          email: email.toLowerCase(),
          deletedAt: null,
        },
      },
      include: { user: true },
    });
    return member !== null ? CompanyMember.fromPrisma(member) : null;
  }

  async listMembers(
    companyId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ members: CompanyMember[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.db.companyMember.findMany({
        where: { companyId, deletedAt: null },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      this.db.companyMember.count({
        where: { companyId, deletedAt: null },
      }),
    ]);

    const members = rows.map((r) => CompanyMember.fromPrisma(r));
    return { members, total };
  }

  async inviteMember(
    companyId: string,
    email: string,
    role: string,
    invitedByUserId: string,
  ): Promise<CompanyMember> {
    const targetEmail = email.toLowerCase().trim();

    const member = await this.db.$transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: { email: targetEmail, deletedAt: null },
      });

      user ??= await tx.user.create({
        data: {
          email: targetEmail,
          role: role as Role,
          status: 'PENDING_VERIFICATION',
          firstName: targetEmail.split('@')[0] ?? 'Team',
          lastName: 'Member',
          passwordHash: null,
        },
      });

      const createdMember = await tx.companyMember.create({
        data: {
          companyId,
          userId: user.id,
          role: role as Role,
          invitedBy: invitedByUserId,
          joinedAt: null,
        },
        include: { user: true },
      });

      return createdMember;
    });

    return CompanyMember.fromPrisma(member);
  }

  async removeMember(companyId: string, userId: string): Promise<boolean> {
    const existing = await this.db.companyMember.findFirst({
      where: { companyId, userId, deletedAt: null },
    });

    if (existing === null) {
      return false;
    }

    await this.db.companyMember.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
