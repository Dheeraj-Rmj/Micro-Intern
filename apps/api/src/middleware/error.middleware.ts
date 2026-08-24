import { Prisma } from '@microintern/database';
import { ZodError } from 'zod';

import { logger } from '@/core/logger.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  InternalServerError,
  isAppError,
} from '@/shared/errors/index.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type {
  AppError} from '@/shared/errors/index.js';
import type { ErrorRequestHandler , Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 *
 * Design: Single error handling location — no try/catch in controllers.
 * Errors thrown anywhere in the route chain reach this handler.
 *
 * Error classification:
 * 1. AppError (our errors) → pass through with their defined statusCode
 * 2. ZodError → convert to ValidationError (should not reach here if validate middleware is used)
 * 3. Prisma errors → map to semantic HTTP errors
 * 4. Unknown errors → log as fatal, return generic 500
 *
 * Operational errors (expected business errors) → logged at 'warn'
 * Non-operational errors (bugs) → logged at 'error', trigger alert in production
 */
export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let appError: AppError;

  if (isAppError(error)) {
    // Known application error — use as-is
    appError = error;
  } else if (error instanceof ZodError) {
    // Zod validation error that escaped the validate middleware
    appError = new ValidationError(
      'Validation failed',
      error.issues.map((i) => ({ field: i.path.join('.'), message: i.message, code: i.code })),
    );
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = mapPrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('Invalid database query parameters');
  } else {
    // Unknown error — bug or library error
    appError = new InternalServerError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      error instanceof Error ? error : undefined,
    );
  }

  // ── Logging ─────────────────────────────────────────────────────────────
  const logContext = {
    requestId: (req as Request & { id?: string }).id,
    method: req.method,
    path: req.path,
    statusCode: appError.statusCode,
    errorCode: appError.code,
    isOperational: appError.isOperational,
  };

  if (!appError.isOperational) {
    logger.error({ ...logContext, err: error }, 'Non-operational error — requires investigation');
  } else if (appError.statusCode >= 500) {
    logger.error(logContext, appError.message);
  } else if (appError.statusCode >= 400) {
    logger.warn(logContext, appError.message);
  }

  // ── Response ─────────────────────────────────────────────────────────────
  ResponseFormatter.error(res, {
    statusCode: appError.statusCode,
    code: appError.code,
    message: appError.message,
    details: appError.details as Array<{ field?: string; message: string; code?: string }> | undefined,
  });
};

/**
 * Map Prisma known request errors to semantic application errors.
 */
function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const fields = (error.meta?.['target'] as string[] | undefined)?.join(', ') ?? 'field';
      return new ConflictError(`A record with this ${fields} already exists`);
    }
    case 'P2025': {
      // Record not found
      return new NotFoundError('Record');
    }
    case 'P2003': {
      // Foreign key constraint violation
      return new ValidationError('Referenced resource does not exist');
    }
    case 'P2014': {
      // Relation violation
      return new ValidationError('Invalid relation — cannot perform this operation');
    }
    default: {
      logger.error({ prismaCode: error.code, err: error }, 'Unmapped Prisma error');
      return new InternalServerError('Database operation failed');
    }
  }
}
