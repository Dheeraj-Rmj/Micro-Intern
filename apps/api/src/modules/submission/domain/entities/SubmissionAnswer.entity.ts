export class SubmissionAnswer {
  constructor(
    public readonly id: string,
    public readonly submissionId: string,
    public readonly taskId: string,
    public readonly answerText: string | null,
    public readonly answerFileUrl: string | null,
    public readonly answerData: Record<string, unknown> | null,
    public readonly earnedPoints: number | null,
    public readonly feedback: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(record: any): SubmissionAnswer {
    return new SubmissionAnswer(
      record.id,
      record.submissionId,
      record.taskId,
      record.answerText ?? null,
      record.answerFileUrl ?? null,
      (record.answerData as Record<string, unknown>) ?? null,
      record.earnedPoints != null ? Number(record.earnedPoints) : null,
      record.feedback ?? null,
      record.createdAt,
      record.updatedAt,
    );
  }
}
