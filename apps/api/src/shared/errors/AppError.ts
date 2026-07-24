import { HTTP_STATUS } from '@microintern/shared';

import type { ErrorCode } from '@microintern/shared';

/**
 * Base application error class.
 *
 * Design: Typed error hierarchy enables:
 * - Precise instanceof checks in the global error handler
 * - Consistent error shape across the entire application
 * - Machine-readable error codes for frontend handling
 * - HTTP status code carried on the error — no status mapping table needed
 *
 * All thrown errors in the application SHOULD be instances of AppError
 * or one of its subclasses. Unknown errors (third-party, bugs) are caught
 * by the global error handler and converted to a 500 InternalServerError.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>[];

  constructor({
    code,
    message,
    statusCode,
    isOperational = true,
    details,
    cause,
  }: {
    code: ErrorCode;
    message: string;
    statusCode: number;
    isOperational?: boolean;
    details?: Record<string, unknown>[];
    cause?: Error;
  }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace without this constructor in it
    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize for JSON response.
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>[]) {
    super({ code: 'BAD_REQUEST', message, statusCode: HTTP_STATUS.BAD_REQUEST, details });
  }
}

/**
 * 401 Unauthorized — missing or invalid credentials
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code: ErrorCode = 'UNAUTHORIZED') {
    super({ code, message, statusCode: HTTP_STATUS.UNAUTHORIZED });
  }
}

/**
 * 403 Forbidden — authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', code: ErrorCode = 'FORBIDDEN') {
    super({ code, message, statusCode: HTTP_STATUS.FORBIDDEN });
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier !== undefined
      ? `${resource} with ID "${identifier}" not found`
      : `${resource} not found`;
    super({ code: 'NOT_FOUND', message, statusCode: HTTP_STATUS.NOT_FOUND });
  }
}

/**
 * 409 Conflict — duplicate resource
 */
export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = 'CONFLICT') {
    super({ code, message, statusCode: HTTP_STATUS.CONFLICT });
  }
}

/**
 * 422 Unprocessable Entity — validation failure
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>[]) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details,
    });
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super({ code: 'RATE_LIMIT_EXCEEDED', message, statusCode: HTTP_STATUS.TOO_MANY_REQUESTS });
  }
}

/**
 * 500 Internal Server Error — unexpected/non-operational errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'An unexpected error occurred', cause?: Error) {
    super({
      code: 'INTERNAL_SERVER_ERROR',
      message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      isOperational: false,
      cause,
    });
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code: ErrorCode = 'SERVICE_UNAVAILABLE') {
    super({ code, message, statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE });
  }
}

/**
 * Type guard — check if error is a known operational AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard — check if error is operational (expected, handleable).
 * Non-operational errors indicate bugs and should trigger alerts.
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}
