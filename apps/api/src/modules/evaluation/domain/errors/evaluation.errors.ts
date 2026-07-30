import { DomainError } from '@/shared/errors/index.js';
import type { ErrorCode } from '@microintern/shared';

export class UnauthorizedEvaluationAccessError extends DomainError {
  constructor(submissionId: string, candidateId: string) {
    super({
      message: `Candidate ${candidateId} is not authorized to view evaluation for submission ${submissionId}.`,
      code: 'UNAUTHORIZED_EVALUATION_ACCESS' as ErrorCode,
      domain: 'Evaluation',
      details: [{ submissionId, candidateId }]
    });
    this.name = 'UnauthorizedEvaluationAccessError';
  }
}

export class EvaluationNotFoundError extends DomainError {
  constructor(submissionId: string) {
    super({
      message: `Evaluation for submission ${submissionId} not found.`,
      code: 'EVALUATION_NOT_FOUND' as ErrorCode,
      domain: 'Evaluation',
      details: [{ submissionId }]
    });
    this.name = 'EvaluationNotFoundError';
  }
}
