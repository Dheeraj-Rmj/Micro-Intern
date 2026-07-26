import { SubmissionStatus } from '@microintern/database';

import { Submission } from '../../domain/entities/Submission.entity.js';
import { SubmissionAnswer } from '../../domain/entities/SubmissionAnswer.entity.js';

import type {
  ISubmissionRepository,
  CreateSubmissionData,
  SaveAnswerData,
} from '../../application/ports/ISubmissionRepository.js';
import type { PrismaClient, Prisma } from '@microintern/database';

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

  async findActiveByCandidateAndTrial(candidateId: string, trialId: string): Promise<Submission | null> {
    const record = await this.db.submission.findFirst({
      where: {
        candidateId,
        trialId,
        deletedAt: null,
        status: {
          in: [SubmissionStatus.IN_PROGRESS, SubmissionStatus.INVITED],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: this.standardInclude,
    });
    return record ? Submission.fromPrisma(record) : null;
  }

  async countAttempts(candidateId: string, trialId: string): Promise<number> {
    return await this.db.submission.count({
      where: { candidateId, trialId, deletedAt: null },
    });
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    const record = await this.db.submission.create({
      data: {
        trialId: data.trialId,
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
    metadata?: { submittedAt?: Date; totalScore?: number; isPassed?: boolean }
  ): Promise<Submission> {
    const record = await this.db.submission.update({
      where: { id },
      data: {
        status,
        ...(metadata?.submittedAt ? { submittedAt: metadata.submittedAt } : {}),
        ...(metadata?.totalScore !== undefined ? { totalScore: metadata.totalScore } : {}),
        ...(metadata?.isPassed !== undefined ? { isPassed: metadata.isPassed } : {}),
      },
      include: this.standardInclude,
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
    pagination: { skip: number; take: number }
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
        orderBy: { createdAt: 'desc' },
        include: this.standardInclude,
      }),
    ]);

    return {
      submissions: records.map((r) => Submission.fromPrisma(r)),
      total,
    };
  }
}
