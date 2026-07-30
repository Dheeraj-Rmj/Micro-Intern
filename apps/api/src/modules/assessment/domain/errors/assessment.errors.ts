import { ErrorCode } from "@microintern/shared";

import { AppError } from "@/shared/errors/AppError.js";

export class AssessmentNotFoundError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier ? `Assessment not found: ${identifier}` : "Assessment not found",
      code: ErrorCode.ASSESSMENT_NOT_FOUND,
      statusCode: 404,
    });
  }
}

export class AssessmentNotPublishedError extends AppError {
  constructor(identifier?: string) {
    super({
      message: identifier
        ? `Assessment is not published or available: ${identifier}`
        : "Assessment is not published",
      code: ErrorCode.ASSESSMENT_NOT_PUBLISHED,
      statusCode: 403,
    });
  }
}

export class AssessmentCannotPublishWithoutTasksError extends AppError {
  constructor() {
    super({
      message: "Cannot publish a assessment that has zero assessment tasks configured.",
      code: ErrorCode.VALIDATION_ERROR,
      statusCode: 400,
    });
  }
}

export class AssessmentImmutableWhenPublishedError extends AppError {
  constructor() {
    super({
      message:
        "Structural assessment tasks cannot be modified once a assessment is published or closed.",
      code: ErrorCode.CONFLICT,
      statusCode: 409,
    });
  }
}

export class AssessmentTaskNotFoundError extends AppError {
  constructor(taskId?: string) {
    super({
      message: taskId ? `Assessment task not found: ${taskId}` : "Assessment task not found",
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
    });
  }
}
