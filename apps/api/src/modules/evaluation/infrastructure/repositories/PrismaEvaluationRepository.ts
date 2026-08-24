import { Evaluation } from "../../domain/entities/Evaluation.entity.js";

import type {
  IEvaluationRepository,
  SaveEvaluationData,
} from "../../application/ports/IEvaluationRepository.js";
import type { EvaluationStatus, PrismaClient, Prisma } from "@microintern/database";

export class PrismaEvaluationRepository implements IEvaluationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findBySubmissionId(submissionId: string): Promise<Evaluation | null> {
    const record = await this.db.evaluation.findUnique({
      where: { submissionId },
    });
    return record && !record.deletedAt ? Evaluation.fromPrisma(record) : null;
  }

  async save(data: SaveEvaluationData): Promise<Evaluation> {
    const record = await this.db.evaluation.upsert({
      where: { submissionId: data.submissionId },
      update: {
        status: data.status,
        aiProvider: data.aiProvider,
        aiModel: data.aiModel,
        promptVersion: data.promptVersion,
        totalScore: data.totalScore !== undefined ? data.totalScore : undefined,
        maxPossibleScore: data.maxPossibleScore !== undefined ? data.maxPossibleScore : undefined,
        percentageScore: data.percentageScore !== undefined ? data.percentageScore : undefined,
        isPassed: data.isPassed !== undefined ? data.isPassed : undefined,
        summary: data.summary,
        strengths: data.strengths,
        improvements: data.improvements,
        rawResponse: data.rawResponse ? (data.rawResponse as Prisma.InputJsonValue) : undefined,
        startedAt: data.startedAt,
        completedAt: data.completedAt ?? new Date(),
      },
      create: {
        submissionId: data.submissionId,
        status: data.status,
        aiProvider: data.aiProvider,
        aiModel: data.aiModel,
        promptVersion: data.promptVersion,
        totalScore: data.totalScore,
        maxPossibleScore: data.maxPossibleScore,
        percentageScore: data.percentageScore,
        isPassed: data.isPassed,
        summary: data.summary,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        rawResponse: data.rawResponse ? (data.rawResponse as Prisma.InputJsonValue) : undefined,
        startedAt: data.startedAt ?? new Date(),
        completedAt: data.completedAt ?? new Date(),
      },
    });
    return Evaluation.fromPrisma(record);
  }

  async updateStatus(id: string, status: EvaluationStatus): Promise<Evaluation> {
    const record = await this.db.evaluation.update({
      where: { id },
      data: { status },
    });
    return Evaluation.fromPrisma(record);
  }
}
