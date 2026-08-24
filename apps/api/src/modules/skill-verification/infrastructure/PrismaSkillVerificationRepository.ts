import { PrismaClient, SkillVerificationStatus } from "@microintern/database";
import type { SkillVerificationRecord } from "@microintern/database";
import type {
  ISkillVerificationRepository,
  UpsertVerificationDTO,
} from "../domain/ISkillVerificationRepository.js";

export class PrismaSkillVerificationRepository implements ISkillVerificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCandidateAndSkill(
    candidateId: string,
    skillId: string,
  ): Promise<SkillVerificationRecord | null> {
    return this.prisma.skillVerificationRecord.findUnique({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
      include: {
        skill: true,
      } as any,
    });
  }

  async listByCandidate(
    candidateId: string,
    status?: SkillVerificationStatus,
  ): Promise<SkillVerificationRecord[]> {
    const where: any = { candidateId };
    if (status) {
      where.status = status;
    }
    return this.prisma.skillVerificationRecord.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        skill: true,
      } as any,
    });
  }

  async upsert(data: UpsertVerificationDTO): Promise<SkillVerificationRecord> {
    return this.prisma.skillVerificationRecord.upsert({
      where: {
        candidateId_skillId: {
          candidateId: data.candidateId,
          skillId: data.skillId,
        },
      },
      update: {
        status: data.status,
        confidenceScore: data.confidenceScore,
        verifiedById: data.verifiedById,
        verificationNote: data.verificationNote,
        verifiedAt: new Date(),
      },
      create: {
        candidateId: data.candidateId,
        skillId: data.skillId,
        status: data.status,
        confidenceScore: data.confidenceScore ?? 50.0,
        verifiedById: data.verifiedById,
        verificationNote: data.verificationNote,
        verifiedAt: new Date(),
      },
      include: {
        skill: true,
      } as any,
    });
  }

  async delete(candidateId: string, skillId: string): Promise<void> {
    await this.prisma.skillVerificationRecord.delete({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
    });
  }
}
