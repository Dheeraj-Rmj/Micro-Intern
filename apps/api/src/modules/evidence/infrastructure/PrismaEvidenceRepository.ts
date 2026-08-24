import { PrismaClient, EvidenceVerificationStatus } from "@microintern/database";
import type {
  Evidence,
  EvidenceSkillMapping,
  EvidenceCompetencyMapping,
  EvidenceType,
} from "@microintern/database";
import type {
  IEvidenceRepository,
  CreateEvidenceDTO,
  VerifyEvidenceDTO,
} from "../domain/IEvidenceRepository.js";

export class PrismaEvidenceRepository implements IEvidenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Evidence | null> {
    return this.prisma.evidence.findUnique({
      where: { id },
      include: {
        linkedSkills: { include: { skill: true } },
        linkedCompetencies: { include: { competency: true } },
      } as any,
    });
  }

  async listByCandidate(
    candidateId: string,
    options?: { type?: EvidenceType; status?: EvidenceVerificationStatus },
  ): Promise<Evidence[]> {
    const where: any = {
      candidateId,
      deletedAt: null,
    };
    if (options?.type) {
      where.type = options.type;
    }
    if (options?.status) {
      where.verificationStatus = options.status;
    }

    return this.prisma.evidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        linkedSkills: { include: { skill: true } },
        linkedCompetencies: { include: { competency: true } },
      } as any,
    });
  }

  async listBySubmission(submissionId: string): Promise<Evidence[]> {
    return this.prisma.evidence.findMany({
      where: {
        submissionId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        linkedSkills: { include: { skill: true } },
        linkedCompetencies: { include: { competency: true } },
      } as any,
    });
  }

  async create(data: CreateEvidenceDTO): Promise<Evidence> {
    const evidence = await this.prisma.evidence.create({
      data: {
        candidateId: data.candidateId,
        submissionId: data.submissionId,
        title: data.title,
        type: data.type,
        url: data.url,
        description: data.description,
        confidenceScore: data.confidenceScore ?? 80.0,
        qualityScore: data.qualityScore ?? 80.0,
        metadata: (data.metadata || {}) as any,
      },
    });

    if (data.skillIds && data.skillIds.length > 0) {
      for (const item of data.skillIds) {
        await this.linkSkill(evidence.id, item.skillId, item.confidence, item.notes);
      }
    }

    if (data.competencyIds && data.competencyIds.length > 0) {
      for (const item of data.competencyIds) {
        await this.linkCompetency(evidence.id, item.competencyId, item.confidence, item.notes);
      }
    }

    return (await this.findById(evidence.id))!;
  }

  async updateVerificationStatus(data: VerifyEvidenceDTO): Promise<Evidence> {
    const updateData: any = {
      verificationStatus: data.status,
    };
    if (data.reviewNotes !== undefined) {
      updateData.reviewNotes = data.reviewNotes;
    }
    if (data.qualityScore !== undefined) {
      updateData.qualityScore = data.qualityScore;
    }

    await this.prisma.evidence.update({
      where: { id: data.evidenceId },
      data: updateData,
    });

    return (await this.findById(data.evidenceId))!;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evidence.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async linkSkill(
    evidenceId: string,
    skillId: string,
    confidence?: number,
    notes?: string,
  ): Promise<EvidenceSkillMapping> {
    return this.prisma.evidenceSkillMapping.upsert({
      where: {
        evidenceId_skillId: {
          evidenceId,
          skillId,
        },
      },
      update: {
        confidence: confidence ?? 80.0,
        notes,
      },
      create: {
        evidenceId,
        skillId,
        confidence: confidence ?? 80.0,
        notes,
      },
    });
  }

  async linkCompetency(
    evidenceId: string,
    competencyId: string,
    confidence?: number,
    notes?: string,
  ): Promise<EvidenceCompetencyMapping> {
    return this.prisma.evidenceCompetencyMapping.upsert({
      where: {
        evidenceId_competencyId: {
          evidenceId,
          competencyId,
        },
      },
      update: {
        confidence: confidence ?? 80.0,
        notes,
      },
      create: {
        evidenceId,
        competencyId,
        confidence: confidence ?? 80.0,
        notes,
      },
    });
  }
}
