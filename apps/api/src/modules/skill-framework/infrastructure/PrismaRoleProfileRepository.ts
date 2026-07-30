import { PrismaClient } from '@microintern/database';
import type { RoleProfile, RequiredSkill, RequiredCompetency, HiringBenchmark } from '@microintern/database';
import type {
  IRoleProfileRepository,
  CreateRoleProfileDTO,
  AddRequiredSkillDTO,
  AddRequiredCompetencyDTO,
  AddHiringBenchmarkDTO,
} from '../domain/IRoleProfileRepository.js';

export class PrismaRoleProfileRepository implements IRoleProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<RoleProfile | null> {
    return this.prisma.roleProfile.findUnique({
      where: { id },
      include: {
        requiredSkills: { include: { skill: true } },
        requiredCompetencies: { include: { competency: true } },
        benchmarks: true,
      } as any,
    });
  }

  async listByCompany(companyId: string): Promise<RoleProfile[]> {
    return this.prisma.roleProfile.findMany({
      where: { companyId, isActive: true },
      orderBy: { title: 'asc' },
      include: {
        requiredSkills: { include: { skill: true } },
        requiredCompetencies: { include: { competency: true } },
      } as any,
    });
  }

  async create(data: CreateRoleProfileDTO): Promise<RoleProfile> {
    return this.prisma.roleProfile.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        level: data.level ?? 'MID',
        description: data.description,
        minimumOverallScore: data.minimumOverallScore ?? 70.0,
      },
    });
  }

  async update(id: string, data: Partial<CreateRoleProfileDTO>): Promise<RoleProfile> {
    return this.prisma.roleProfile.update({
      where: { id },
      data: {
        title: data.title,
        level: data.level,
        description: data.description,
        minimumOverallScore: data.minimumOverallScore,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roleProfile.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addRequiredSkill(data: AddRequiredSkillDTO): Promise<RequiredSkill> {
    return this.prisma.requiredSkill.upsert({
      where: {
        roleProfileId_skillId: {
          roleProfileId: data.roleProfileId,
          skillId: data.skillId,
        },
      },
      update: {
        minimumScore: data.minimumScore,
        weight: data.weight,
        isCritical: data.isCritical,
      },
      create: {
        roleProfileId: data.roleProfileId,
        skillId: data.skillId,
        minimumScore: data.minimumScore ?? 70.0,
        weight: data.weight ?? 1.0,
        isCritical: data.isCritical ?? false,
      },
    });
  }

  async getRequiredSkills(roleProfileId: string): Promise<RequiredSkill[]> {
    return this.prisma.requiredSkill.findMany({
      where: { roleProfileId },
      include: { skill: true },
    });
  }

  async addRequiredCompetency(data: AddRequiredCompetencyDTO): Promise<RequiredCompetency> {
    return this.prisma.requiredCompetency.upsert({
      where: {
        roleProfileId_competencyId: {
          roleProfileId: data.roleProfileId,
          competencyId: data.competencyId,
        },
      },
      update: {
        minimumScore: data.minimumScore,
        weight: data.weight,
      },
      create: {
        roleProfileId: data.roleProfileId,
        competencyId: data.competencyId,
        minimumScore: data.minimumScore ?? 75.0,
        weight: data.weight ?? 1.0,
      },
    });
  }

  async getRequiredCompetencies(roleProfileId: string): Promise<RequiredCompetency[]> {
    return this.prisma.requiredCompetency.findMany({
      where: { roleProfileId },
      include: { competency: true },
    });
  }

  async addBenchmark(data: AddHiringBenchmarkDTO): Promise<HiringBenchmark> {
    return this.prisma.hiringBenchmark.create({
      data: {
        roleProfileId: data.roleProfileId,
        metricName: data.metricName,
        targetValue: data.targetValue,
        description: data.description,
      },
    });
  }

  async getBenchmarks(roleProfileId: string): Promise<HiringBenchmark[]> {
    return this.prisma.hiringBenchmark.findMany({
      where: { roleProfileId },
    });
  }
}
