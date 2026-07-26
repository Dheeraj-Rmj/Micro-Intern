import { EvaluationStatus } from '@microintern/database';

export class Evaluation {
  constructor(
    public readonly id: string,
    public readonly submissionId: string,
    public readonly status: EvaluationStatus,
    public readonly aiProvider: string | null,
    public readonly aiModel: string | null,
    public readonly promptVersion: string | null,
    public readonly totalScore: number | null,
    public readonly maxPossibleScore: number | null,
    public readonly percentageScore: number | null,
    public readonly isPassed: boolean | null,
    public readonly summary: string | null,
    public readonly strengths: string[],
    public readonly improvements: string[],
    public readonly rawResponse: Record<string, unknown> | null,
    public readonly reviewedBy: string | null,
    public readonly reviewedAt: Date | null,
    public readonly reviewNotes: string | null,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  isFinished(): boolean {
    return this.status === EvaluationStatus.COMPLETED || this.status === EvaluationStatus.REQUIRES_HUMAN_REVIEW;
  }

  static fromPrisma(record: any): Evaluation {
    return new Evaluation(
      record.id,
      record.submissionId,
      record.status as EvaluationStatus,
      record.aiProvider ?? null,
      record.aiModel ?? null,
      record.promptVersion ?? null,
      record.totalScore != null ? Number(record.totalScore) : null,
      record.maxPossibleScore != null ? Number(record.maxPossibleScore) : null,
      record.percentageScore != null ? Number(record.percentageScore) : null,
      record.isPassed ?? null,
      record.summary ?? null,
      record.strengths ?? [],
      record.improvements ?? [],
      (record.rawResponse as Record<string, unknown>) ?? null,
      record.reviewedBy ?? null,
      record.reviewedAt ?? null,
      record.reviewNotes ?? null,
      record.startedAt ?? null,
      record.completedAt ?? null,
      record.createdAt,
      record.updatedAt,
      record.deletedAt ?? null
    );
  }
}
