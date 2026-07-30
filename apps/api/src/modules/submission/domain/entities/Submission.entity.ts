import { SubmissionStatus } from "@microintern/database";

import {
  AssessmentExpiredError,
  SubmissionAlreadyCompletedError,
} from "../errors/submission.errors.js";

import { Evaluation } from "../../../evaluation/domain/entities/Evaluation.entity.js";
import { SubmissionAnswer } from "./SubmissionAnswer.entity.js";

export class Submission {
  constructor(
    public readonly id: string,
    public readonly assessmentId: string,
    public readonly candidateId: string,
    public readonly status: SubmissionStatus,
    public readonly attemptNumber: number,
    public readonly invitedAt: Date,
    public readonly startedAt: Date | null,
    public readonly submittedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly totalScore: number | null,
    public readonly isPassed: boolean | null,
    public readonly workspaceId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly answers?: SubmissionAnswer[],
    public readonly evaluation?: Evaluation | null,
  ) {}

  /**
   * Enforces domain validation rules before allowing a submission to be committed.
   * - Prohibits modifying a completed or under-evaluation submission.
   * - Validates that the candidate is within the timer expiration window (with a 2-minute network grace period).
   */
  validateCanSubmit(now: Date = new Date()): void {
    const terminalStatuses: SubmissionStatus[] = [
      SubmissionStatus.SUBMITTED,
      SubmissionStatus.UNDER_EVALUATION,
      SubmissionStatus.EVALUATION_COMPLETE,
      SubmissionStatus.PASSED,
      SubmissionStatus.FAILED,
      SubmissionStatus.WITHDRAWN,
      SubmissionStatus.EXPIRED,
    ];

    if (terminalStatuses.includes(this.status)) {
      throw new SubmissionAlreadyCompletedError(this.id, this.status);
    }

    if (this.expiresAt !== null) {
      const gracePeriodMs = 2 * 60 * 1000; // 2 minutes grace period for upload/network latency
      if (now.getTime() > this.expiresAt.getTime() + gracePeriodMs) {
        throw new AssessmentExpiredError(this.id, this.expiresAt.toISOString());
      }
    }
  }

  isCompleted(): boolean {
    return (
      this.status === SubmissionStatus.EVALUATION_COMPLETE ||
      this.status === SubmissionStatus.PASSED ||
      this.status === SubmissionStatus.FAILED
    );
  }

  static fromPrisma(record: any): Submission {
    return new Submission(
      record.id,
      record.assessmentId,
      record.candidateId,
      record.status as SubmissionStatus,
      record.attemptNumber ?? 1,
      record.invitedAt,
      record.startedAt ?? null,
      record.submittedAt ?? null,
      record.expiresAt ?? null,
      record.totalScore != null ? Number(record.totalScore) : null,
      record.isPassed ?? null,
      record.workspaceId ?? null,
      record.createdAt,
      record.updatedAt,
      record.deletedAt ?? null,
      record.answers ? record.answers.map((a: any) => SubmissionAnswer.fromPrisma(a)) : undefined,
      record.evaluation ? Evaluation.fromPrisma(record.evaluation) : null,
    );
  }
}
