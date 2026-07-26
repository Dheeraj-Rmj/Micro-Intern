import { NotFoundError } from '@/shared/errors/AppError.js';
import { DomainError } from '@/shared/errors/DomainError.js';

import type { ErrorCode } from '@microintern/shared';

export class SubmissionNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('Candidate submission', identifier);
    this.name = 'SubmissionNotFoundError';
  }
}

export class EvaluationNotFoundError extends NotFoundError {
  constructor(submissionId: string) {
    super('Evaluation results for submission', submissionId);
    this.name = 'EvaluationNotFoundError';
  }
}

export class TrialExpiredError extends DomainError {
  constructor(submissionId: string, expiredAt: string) {
    super({
      code: 'TRIAL_EXPIRED',
      message: `Trial assessment window expired at ${expiredAt}. Submissions are no longer accepted.`,
      domain: 'Evaluation',
      details: [{ submissionId, expiredAt }],
    });
    this.name = 'TrialExpiredError';
  }
}

export class MaxAttemptsExceededError extends DomainError {
  constructor(trialId: string, maxAttempts: number) {
    super({
      code: 'VALIDATION_ERROR',
      message: `Candidate has reached the maximum number of attempts (${maxAttempts}) for this trial.`,
      domain: 'Evaluation',
      details: [{ trialId, maxAttempts }],
    });
    this.name = 'MaxAttemptsExceededError';
  }
}

export class SubmissionAlreadyCompletedError extends DomainError {
  constructor(submissionId: string, status: string) {
    super({
      code: 'TRIAL_ALREADY_SUBMITTED',
      message: `Submission is already in terminal state (${status}) and cannot be modified or re-submitted.`,
      domain: 'Evaluation',
      details: [{ submissionId, status }],
    });
    this.name = 'SubmissionAlreadyCompletedError';
  }
}

export class SubmissionNotInProgressError extends DomainError {
  constructor(submissionId: string, currentStatus: string) {
    super({
      code: 'TRIAL_NOT_IN_PROGRESS',
      message: `Submission must be IN_PROGRESS to accept candidate answers, but is currently ${currentStatus}.`,
      domain: 'Evaluation',
      details: [{ submissionId, currentStatus }],
    });
    this.name = 'SubmissionNotInProgressError';
  }
}

export class CandidateProfileNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('Candidate profile for user account', userId);
    this.name = 'CandidateProfileNotFoundError';
  }
}
