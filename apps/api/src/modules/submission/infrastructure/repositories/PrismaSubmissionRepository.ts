import { SubmissionStatus } from "@microintern/database";

import { Submission } from "../../domain/entities/Submission.entity.js";
import { SubmissionAnswer } from "../../domain/entities/SubmissionAnswer.entity.js";

import type {
  ISubmissionRepository,
  CreateSubmissionData,
  SaveAnswerData,
} from "../../application/ports/ISubmissionRepository.js";
import type { PrismaClient, Prisma } from "@microintern/database";

export class PrismaSubmissionRepository implements ISubmissionRepository {
  constructor(private readonly db: PrismaClient) {}

  private readonly standardInclude = {
    answers: true,
    evaluation: true,
  };

  async findById(id: string): Promise<Submission | null> {
    const record = await this.db.submission.findFirst({
      where: { id, deletedAt: null },
      include: this.standardInclude,
    });
    return record ? Submission.fromPrisma(record) : null;
  }

  async findActiveByCandidateAndAssessment(
    candidateId: string,
    assessmentId: string,
  ): Promise<Submission | null> {
    const record = await this.db.submission.findFirst({
      where: {
        candidateId,
        assessmentId,
        deletedAt: null,
        status: {
          in: [SubmissionStatus.IN_PROGRESS, SubmissionStatus.INVITED],
        },
      },
      orderBy: { createdAt: "desc" },
      include: this.standardInclude,
    });
    return record ? Submission.fromPrisma(record) : null;
  }

  async countAttempts(candidateId: string, assessmentId: string): Promise<number> {
    return await this.db.submission.count({
      where: { candidateId, assessmentId, deletedAt: null },
    });
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    const record = await this.db.submission.create({
      data: {
        assessmentId: data.assessmentId,
        candidateId: data.candidateId,
        status: data.status ?? SubmissionStatus.INVITED,
        attemptNumber: data.attemptNumber ?? 1,
        startedAt: data.startedAt,
        expiresAt: data.expiresAt,
      },
      include: this.standardInclude,
    });
    return Submission.fromPrisma(record);
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
    metadata?: { submittedAt?: Date; totalScore?: number; isPassed?: boolean },
  ): Promise<Submission> {
    const record = await this.db.$transaction(async (tx) => {
      const updated = await tx.submission.update({
        where: { id },
        data: {
          status,
          ...(metadata?.submittedAt ? { submittedAt: metadata.submittedAt } : {}),
          ...(metadata?.totalScore !== undefined ? { totalScore: metadata.totalScore } : {}),
          ...(metadata?.isPassed !== undefined ? { isPassed: metadata.isPassed } : {}),
        },
        include: { ...this.standardInclude, assessment: true },
      });

      // Manage earnings if the assessment has a stipend amount configured
      if (updated.assessment.stipendAmount !== null) {
        let earningStatus: 'PENDING' | 'AVAILABLE' | 'PAID' | null = null;

        if (status === 'SUBMITTED' || status === 'UNDER_EVALUATION') {
          earningStatus = 'PENDING';
        } else if (status === 'EVALUATION_COMPLETE' || status === 'PASSED') {
          earningStatus = 'AVAILABLE';
        }

        if (earningStatus) {
          await tx.candidateEarning.upsert({
            where: {
              submissionId: updated.id,
            },
            update: {
              status: earningStatus,
              amount: updated.assessment.stipendAmount,
            },
            create: {
              candidateId: updated.candidateId,
              submissionId: updated.id,
              amount: updated.assessment.stipendAmount,
              status: earningStatus,
            },
          });
        }
      }

      return updated;
    });

    return Submission.fromPrisma(record);
  }

  async saveAnswers(submissionId: string, answers: SaveAnswerData[]): Promise<SubmissionAnswer[]> {
    return await this.db.$transaction(async (tx) => {
      const saved: any[] = [];
      for (const ans of answers) {
        const res = await tx.submissionAnswer.upsert({
          where: {
            submissionId_taskId: {
              submissionId,
              taskId: ans.taskId,
            },
          },
          update: {
            answerText: ans.answerText,
            answerFileUrl: ans.answerFileUrl,
            answerData: ans.answerData ? (ans.answerData as Prisma.InputJsonValue) : undefined,
          },
          create: {
            submissionId,
            taskId: ans.taskId,
            answerText: ans.answerText,
            answerFileUrl: ans.answerFileUrl,
            answerData: ans.answerData ? (ans.answerData as Prisma.InputJsonValue) : undefined,
          },
        });
        saved.push(res);
      }
      return saved.map((r) => SubmissionAnswer.fromPrisma(r));
    });
  }

  async listByCandidate(
    candidateId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ submissions: Submission[]; total: number }> {
    const where: Prisma.SubmissionWhereInput = {
      candidateId,
      deletedAt: null,
    };

    const [total, records] = await Promise.all([
      this.db.submission.count({ where }),
      this.db.submission.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: this.standardInclude,
      }),
    ]);

    return {
      submissions: records.map((r) => Submission.fromPrisma(r)),
      total,
    };
  }
}
