import { TrialStatus } from '@microintern/database';

import { Trial } from '../../domain/entities/Trial.entity.js';

import type {
  ITrialRepository,
  CreateTrialData,
  UpdateTrialData,
  PublicTrialsFilter,
  CompanyTrialsFilter,
} from '../../application/ports/ITrialRepository.js';
import type { PrismaClient, Prisma, TaskType } from '@microintern/database';

export class PrismaTrialRepository implements ITrialRepository {
  constructor(private readonly db: PrismaClient) {}

  private readonly standardInclude = {
    tasks: { orderBy: { sortOrder: 'asc' as const } },
    company: { select: { id: true, name: true, slug: true, logoUrl: true } },
  };

  async findById(id: string): Promise<Trial | null> {
    const record = await this.db.trial.findFirst({
      where: { id, deletedAt: null },
      include: this.standardInclude,
    });
    return record !== null ? Trial.fromPrisma(record) : null;
  }

  async findBySlug(slug: string): Promise<Trial | null> {
    const record = await this.db.trial.findFirst({
      where: { slug, deletedAt: null },
      include: this.standardInclude,
    });
    return record !== null ? Trial.fromPrisma(record) : null;
  }

  async findByIdOrSlug(identifier: string): Promise<Trial | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) {
      const byId = await this.findById(identifier);
      if (byId) return byId;
    }
    return await this.findBySlug(identifier);
  }

  async create(data: CreateTrialData): Promise<Trial> {
    const record = await this.db.trial.create({
      data: {
        companyId: data.companyId,
        createdById: data.createdById,
        status: TrialStatus.DRAFT,
        title: data.title,
        slug: data.slug,
        description: data.description,
        instructions: data.instructions,
        skillsRequired: data.skillsRequired || [],
        roleTitle: data.roleTitle,
        level: data.level,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore ?? 70,
        maxAttempts: data.maxAttempts ?? 1,
        isPublic: data.isPublic ?? false,
        tasks: data.tasks?.length
          ? {
              create: data.tasks.map((task) => ({
                title: task.title,
                description: task.description,
                taskType: task.taskType as TaskType,
                isRequired: task.isRequired ?? true,
                maxPoints: task.maxPoints ?? 100,
                sortOrder: task.sortOrder,
                config: (task.config || {}) as any,
              })),
            }
          : undefined,
      },
      include: this.standardInclude,
    });

    return Trial.fromPrisma(record);
  }

  async update(id: string, data: UpdateTrialData): Promise<Trial> {
    return await this.db.$transaction(async (tx) => {
      if (data.tasks !== undefined) {
        await tx.trialTask.deleteMany({ where: { trialId: id } });
      }

      const record = await tx.trial.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          skillsRequired: data.skillsRequired,
          roleTitle: data.roleTitle,
          level: data.level,
          durationMinutes: data.durationMinutes,
          passingScore: data.passingScore,
          maxAttempts: data.maxAttempts,
          isPublic: data.isPublic,
          tasks: data.tasks?.length
            ? {
                create: data.tasks.map((task) => ({
                  title: task.title,
                  description: task.description,
                  taskType: task.taskType as TaskType,
                  isRequired: task.isRequired ?? true,
                  maxPoints: task.maxPoints ?? 100,
                  sortOrder: task.sortOrder,
                  config: (task.config || {}) as any,
                })),
              }
            : undefined,
        },
        include: this.standardInclude,
      });

      return Trial.fromPrisma(record);
    });
  }

  async publish(id: string, publishedAt: Date): Promise<Trial> {
    const record = await this.db.trial.update({
      where: { id },
      data: {
        status: TrialStatus.PUBLISHED,
        publishedAt,
      },
      include: this.standardInclude,
    });
    return Trial.fromPrisma(record);
  }

  async listCompanyTrials(companyId: string, filter: CompanyTrialsFilter): Promise<{ trials: Trial[]; total: number }> {
    const where: Prisma.TrialWhereInput = {
      companyId,
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [total, records] = await Promise.all([
      this.db.trial.count({ where }),
      this.db.trial.findMany({
        where,
        skip: filter.skip,
        take: filter.take,
        orderBy: { createdAt: 'desc' },
        include: this.standardInclude,
      }),
    ]);

    return {
      trials: records.map((r) => Trial.fromPrisma(r)),
      total,
    };
  }

  async listPublicTrials(filter: PublicTrialsFilter): Promise<{ trials: Trial[]; total: number }> {
    const where: Prisma.TrialWhereInput = {
      status: TrialStatus.PUBLISHED,
      deletedAt: null,
      ...(filter.level ? { level: filter.level } : {}),
      ...(filter.skill ? { skillsRequired: { has: filter.skill } } : {}),
      ...(filter.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: 'insensitive' } },
              { description: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, records] = await Promise.all([
      this.db.trial.count({ where }),
      this.db.trial.findMany({
        where,
        skip: filter.skip,
        take: filter.take,
        orderBy: { publishedAt: 'desc' },
        include: this.standardInclude,
      }),
    ]);

    return {
      trials: records.map((r) => Trial.fromPrisma(r)),
      total,
    };
  }
}
