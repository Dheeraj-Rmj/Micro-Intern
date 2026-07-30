import type { PrismaClient } from '@microintern/database';

export interface SearchPaginationOptions {
  limit?: number;
  cursor?: string;
}

export class SearchEngineService {
  constructor(private readonly prisma: PrismaClient) {}

  async searchSkills(query?: string, categoryId?: string, minDifficulty?: number, options?: SearchPaginationOptions) {
    const limit = options?.limit ?? 20;
    const where: any = {};

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minDifficulty !== undefined) {
      where.difficulty = { gte: minDifficulty };
    }

    const items = await this.prisma.skill.findMany({
      where,
      take: limit + 1,
      cursor: options?.cursor ? { id: options.cursor } : undefined,
      orderBy: { name: 'asc' },
      include: { category: true } as any,
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }

  async searchRoleProfiles(query?: string, companyId?: string, options?: SearchPaginationOptions) {
    const limit = options?.limit ?? 20;
    const where: any = { isActive: true };

    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
    }
    if (companyId) {
      where.companyId = companyId;
    }

    const items = await this.prisma.roleProfile.findMany({
      where,
      take: limit + 1,
      cursor: options?.cursor ? { id: options.cursor } : undefined,
      orderBy: { title: 'asc' },
      include: { requiredSkills: { include: { skill: true } } } as any,
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }

  async searchEvidence(query?: string, candidateId?: string, verificationStatus?: string, options?: SearchPaginationOptions): Promise<{ items: any[]; nextCursor?: string }> {
    const limit = options?.limit ?? 20;
    const where: any = { deletedAt: null };

    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
    }
    if (candidateId) {
      where.candidateId = candidateId;
    }
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const items = await this.prisma.evidence.findMany({
      where,
      take: limit + 1,
      cursor: options?.cursor ? { id: options.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { linkedSkills: { include: { skill: true } } } as any,
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }

  async searchPortfolios(query?: string, minScore?: number, options?: SearchPaginationOptions): Promise<{ items: any[]; nextCursor?: string }> {
    const limit = options?.limit ?? 20;
    const where: any = { isPublic: true };

    if (query) {
      where.bio = { contains: query, mode: 'insensitive' };
    }
    if (minScore !== undefined) {
      where.overallSkillScore = { gte: minScore };
    }

    const items = await this.prisma.candidatePortfolio.findMany({
      where,
      take: limit + 1,
      cursor: options?.cursor ? { id: options.cursor } : undefined,
      orderBy: { overallSkillScore: 'desc' },
      include: { projects: true } as any,
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }
}
