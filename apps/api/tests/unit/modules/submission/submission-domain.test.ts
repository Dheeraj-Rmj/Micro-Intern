import { SubmissionStatus } from "@microintern/database";
import { describe, it, expect } from "vitest";

import { Submission } from "@/modules/submission/domain/entities/Submission.entity.js";
import {
  AssessmentExpiredError,
  SubmissionAlreadyCompletedError,
} from "@/modules/submission/domain/errors/submission.errors.js";

describe("Submission Domain Entity Validation", () => {
  const baseSubmissionProps = {
    id: "sub-1",
    assessmentId: "assessment-1",
    candidateId: "cand-1",
    attemptNumber: 1,
    invitedAt: new Date(2026, 6, 26, 10, 0),
    startedAt: new Date(2026, 6, 26, 10, 0),
    submittedAt: null,
    totalScore: null,
    isPassed: null,
    workspaceId: null,
    createdAt: new Date(2026, 6, 26, 10, 0),
    updatedAt: new Date(2026, 6, 26, 10, 0),
    deletedAt: null,
  };

  it("should pass validation when status is IN_PROGRESS and within timer expiration window", () => {
    const now = new Date(2026, 6, 26, 10, 30);
    const expiresAt = new Date(2026, 6, 26, 11, 0); // 30 minutes left

    const submission = new Submission(
      baseSubmissionProps.id,
      baseSubmissionProps.assessmentId,
      baseSubmissionProps.candidateId,
      SubmissionStatus.IN_PROGRESS,
      baseSubmissionProps.attemptNumber,
      baseSubmissionProps.invitedAt,
      baseSubmissionProps.startedAt,
      baseSubmissionProps.submittedAt,
      expiresAt,
      baseSubmissionProps.totalScore,
      baseSubmissionProps.isPassed,
      baseSubmissionProps.workspaceId,
      baseSubmissionProps.createdAt,
      baseSubmissionProps.updatedAt,
      baseSubmissionProps.deletedAt,
    );

    expect(() => submission.validateCanSubmit(now)).not.toThrow();
  });

  it("should throw SubmissionAlreadyCompletedError if submission is already in SUBMITTED or PASSED status", () => {
    const now = new Date(2026, 6, 26, 10, 30);
    const expiresAt = new Date(2026, 6, 26, 11, 0);

    const submission = new Submission(
      baseSubmissionProps.id,
      baseSubmissionProps.assessmentId,
      baseSubmissionProps.candidateId,
      SubmissionStatus.SUBMITTED,
      baseSubmissionProps.attemptNumber,
      baseSubmissionProps.invitedAt,
      baseSubmissionProps.startedAt,
      baseSubmissionProps.submittedAt,
      expiresAt,
      baseSubmissionProps.totalScore,
      baseSubmissionProps.isPassed,
      baseSubmissionProps.workspaceId,
      baseSubmissionProps.createdAt,
      baseSubmissionProps.updatedAt,
      baseSubmissionProps.deletedAt,
    );

    expect(() => submission.validateCanSubmit(now)).toThrow(SubmissionAlreadyCompletedError);
  });

  it("should throw AssessmentExpiredError when submission attempts to commit past expiresAt grace period", () => {
    // 3 minutes after expiresAt (beyond the 2-minute grace period)
    const now = new Date(2026, 6, 26, 11, 3, 1);
    const expiresAt = new Date(2026, 6, 26, 11, 0);

    const submission = new Submission(
      baseSubmissionProps.id,
      baseSubmissionProps.assessmentId,
      baseSubmissionProps.candidateId,
      SubmissionStatus.IN_PROGRESS,
      baseSubmissionProps.attemptNumber,
      baseSubmissionProps.invitedAt,
      baseSubmissionProps.startedAt,
      baseSubmissionProps.submittedAt,
      expiresAt,
      baseSubmissionProps.totalScore,
      baseSubmissionProps.isPassed,
      baseSubmissionProps.workspaceId,
      baseSubmissionProps.createdAt,
      baseSubmissionProps.updatedAt,
      baseSubmissionProps.deletedAt,
    );

    expect(() => submission.validateCanSubmit(now)).toThrow(AssessmentExpiredError);
  });
});
