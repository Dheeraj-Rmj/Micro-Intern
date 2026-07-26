import { ErrorCode } from '@microintern/shared';

import { AppError } from '@/shared/errors/AppError.js';

export class TrialNotFoundError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Trial not found: ${identifier}` : 'Trial not found',
      code: ErrorCode.TRIAL_NOT_FOUND,
      statusCode: 404,
    });
  }
}

export class TrialNotPublishedError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Trial is not published or available: ${identifier}` : 'Trial is not published',
      code: ErrorCode.TRIAL_NOT_PUBLISHED,
      statusCode: 403,
    });
  }
}

export class TrialCannotPublishWithoutTasksError extends AppError {
  constructor() {
    super({
      message: 'Cannot publish a trial that has zero assessment tasks configured.',
      code: ErrorCode.VALIDATION_ERROR,
      statusCode: 400,
    });
  }
}

export class TrialImmutableWhenPublishedError extends AppError {
  constructor() {
    super({
      message: 'Structural assessment tasks cannot be modified once a trial is published or closed.',
      code: ErrorCode.CONFLICT,
      statusCode: 409,
    });
  }
}

export class TrialTaskNotFoundError extends AppError {
  constructor(taskId?: string) {
    super({
      message: taskId ? `Trial task not found: ${taskId}` : 'Trial task not found',
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
    });
  }
}
