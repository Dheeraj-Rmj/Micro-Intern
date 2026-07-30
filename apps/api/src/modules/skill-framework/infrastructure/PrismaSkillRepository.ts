import { PrismaClient, SkillRelationshipType } from '@microintern/database';
import type { Skill, SkillCategory, SubSkill, SkillRelationship } from '@microintern/database';
import type {
  ISkillRepository,
  CreateSkillDTO,
  CreateSkillRelationshipDTO,
} from '../domain/ISkillRepository.js';

export class PrismaSkillRepository implements ISkillRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Skill | null> {
    return this.prisma.skill.findUnique({
      where: { id },
      include: {
        category: true,
        subSkills: true,
      } as any,
    });
  }

  async findByName(name: string): Promise<Skill | null> {
    return this.prisma.skill.findUnique({
      where: { name },
    });
  }

  async findAll(options?: { categoryId?: string; minDifficulty?: number }): Promise<Skill[]> {
    const where: any = {};
    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.minDifficulty !== undefined) {
      where.difficulty = { gte: options.minDifficulty };
    }
    return this.prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async create(data: CreateSkillDTO): Promise<Skill> {
    return this.prisma.skill.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
        difficulty: data.difficulty ?? 3,
        weight: data.weight ?? 1.0,
      },
    });
  }

  async update(id: string, data: Partial<CreateSkillDTO>): Promise<Skill> {
    return this.prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
        difficulty: data.difficulty,
        weight: data.weight,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skill.delete({
      where: { id },
    });
  }

  async createCategory(name: string, description?: string): Promise<SkillCategory> {
    return this.prisma.skillCategory.create({
      data: { name, description },
    });
  }

  async listCategories(): Promise<SkillCategory[]> {
    return this.prisma.skillCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createSubSkill(
    skillId: string,
    name: string,
    difficulty?: number,
    description?: string
  ): Promise<SubSkill> {
    return this.prisma.subSkill.create({
      data: {
        skillId,
        name,
        difficulty: difficulty ?? 2,
        description,
      },
    });
  }

  async listSubSkills(skillId: string): Promise<SubSkill[]> {
    return this.prisma.subSkill.findMany({
      where: { skillId },
      orderBy: { name: 'asc' },
    });
  }

  async createRelationship(data: CreateSkillRelationshipDTO): Promise<SkillRelationship> {
    return this.prisma.skillRelationship.create({
      data: {
        sourceSkillId: data.sourceSkillId,
        targetSkillId: data.targetSkillId,
        relationshipType: data.relationshipType,
        strength: data.strength ?? 1.0,
      },
    });
  }

  async getSkillGraph(skillId: string): Promise<{
    skill: Skill;
    prerequisites: Skill[];
    relatedSkills: Skill[];
    coOccurringSkills: Skill[];
  }> {
    const skill = await this.findById(skillId);
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`);
    }

    const sourceRelations = await this.prisma.skillRelationship.findMany({
      where: { sourceSkillId: skillId },
      include: { targetSkill: true },
    });

    const targetRelations = await this.prisma.skillRelationship.findMany({
      where: { targetSkillId: skillId },
      include: { sourceSkill: true },
    });

    const prerequisites = targetRelations
      .filter((r) => r.relationshipType === SkillRelationshipType.PREREQUISITE)
      .map((r) => r.sourceSkill);

    const relatedSkills = [
      ...sourceRelations
        .filter((r) => r.relationshipType === SkillRelationshipType.RELATED)
        .map((r) => r.targetSkill),
      ...targetRelations
        .filter((r) => r.relationshipType === SkillRelationshipType.RELATED)
        .map((r) => r.sourceSkill),
    ];

    const coOccurringSkills = [
      ...sourceRelations
        .filter((r) => r.relationshipType === SkillRelationshipType.CO_OCCURS)
        .map((r) => r.targetSkill),
      ...targetRelations
        .filter((r) => r.relationshipType === SkillRelationshipType.CO_OCCURS)
        .map((r) => r.sourceSkill),
    ];

    return {
      skill,
      prerequisites,
      relatedSkills,
      coOccurringSkills,
    };
  }
}
