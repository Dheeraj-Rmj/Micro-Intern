import { ErrorCode } from '@microintern/shared';

import { AppError } from '@/shared/errors/AppError.js';

export class PipelineNotFoundError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Pipeline not found: ${identifier}` : 'Pipeline not found',
      code: ErrorCode.PIPELINE_NOT_FOUND,
      statusCode: 404,
    });
    this.name = 'PipelineNotFoundError';
  }
}

export class PipelineStageNotFoundError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Pipeline stage not found: ${identifier}` : 'Pipeline stage not found',
      code: ErrorCode.PIPELINE_STAGE_NOT_FOUND,
      statusCode: 404,
    });
    this.name = 'PipelineStageNotFoundError';
  }
}

export class PipelineEntryNotFoundError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Pipeline candidate entry not found: ${identifier}` : 'Pipeline candidate entry not found',
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
    });
    this.name = 'PipelineEntryNotFoundError';
  }
}

export class PipelineInvalidTransitionError extends AppError {
  constructor(reason: string) {
    super({
      message: `Invalid pipeline transition: ${reason}`,
      code: ErrorCode.PIPELINE_INVALID_TRANSITION,
      statusCode: 400,
    });
    this.name = 'PipelineInvalidTransitionError';
  }
}
