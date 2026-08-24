import { prisma } from "@/core/database.js";

export interface ICompetencyRepository {
  findByName(name: string): Promise<any | null>;
  listAll(category?: string): Promise<any[]>;
  createCompetency(data: { name: string; description: string; category?: string }): Promise<any>;
  listMappingsForAssessment(assessmentId: string): Promise<any[]>;
  upsertMapping(data: {
    competencyId: string;
    assessmentId?: string;
    taskId?: string;
    criteriaId?: string;
    weight?: number;
    importance?: any;
    minLevel?: any;
    notes?: string;
  }): Promise<any>;
  deleteMapping(mappingId: string): Promise<void>;
}

export class PrismaCompetencyRepository implements ICompetencyRepository {
  public async findByName(name: string): Promise<any | null> {
    return prisma.competency.findUnique({
      where: { name },
    });
  }

  public async listAll(category?: string): Promise<any[]> {
    return prisma.competency.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: "asc" },
    });
  }

  public async createCompetency(data: {
    name: string;
    description: string;
    category?: string;
  }): Promise<any> {
    return prisma.competency.upsert({
      where: { name: data.name },
      create: {
        name: data.name,
        description: data.description,
        category: data.category || "Core",
      },
      update: {
        description: data.description,
        category: data.category || "Core",
      },
    });
  }

  public async listMappingsForAssessment(assessmentId: string): Promise<any[]> {
    return prisma.competencyMapping.findMany({
      where: { assessmentId },
      include: { competency: true },
      orderBy: { weight: "desc" },
    });
  }

  public async upsertMapping(data: {
    competencyId: string;
    assessmentId?: string;
    taskId?: string;
    criteriaId?: string;
    weight?: number;
    importance?: any;
    minLevel?: any;
    notes?: string;
  }): Promise<any> {
    return prisma.competencyMapping.create({
      data: {
        competencyId: data.competencyId,
        assessmentId: data.assessmentId || null,
        taskId: data.taskId || null,
        criteriaId: data.criteriaId || null,
        weight: data.weight ?? 10.0,
        importance: data.importance || "MEDIUM",
        minLevel: data.minLevel || "SENIOR",
        notes: data.notes || null,
      },
      include: { competency: true },
    });
  }

  public async deleteMapping(mappingId: string): Promise<void> {
    await prisma.competencyMapping.delete({
      where: { id: mappingId },
    });
  }
}

export const competencyRepository = new PrismaCompetencyRepository();
