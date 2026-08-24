import type { PaginationMeta, CursorPaginationMeta } from "@microintern/shared";
import type { Response } from "express";

/**
 * Standard API Response Formatter.
 *
 * Design: All responses sent through this formatter — enforces the envelope
 * contract defined in @microintern/shared. Direct res.json() calls in controllers
 * are forbidden (enforced by ESLint custom rule in feature teams' guide).
 *
 * Every response includes requestId and timestamp for traceability.
 */

export type SendOptions = {
  statusCode?: number;
  pagination?: PaginationMeta;
  cursorPagination?: CursorPaginationMeta;
};

export class ResponseFormatter {
  /**
   * Send a successful response.
   */
  static success<T>(res: Response, data: T, options: SendOptions = {}): Response {
    const { statusCode = 200, pagination, cursorPagination } = options;

    const requestId = ResponseFormatter.getRequestId(res);

    return res.status(statusCode).json({
      success: true,
      data,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        ...(pagination !== undefined && { pagination }),
        ...(cursorPagination !== undefined && { cursorPagination }),
      },
    });
  }

  /**
   * Send a 201 Created response.
   */
  static created<T>(res: Response, data: T): Response {
    return ResponseFormatter.success(res, data, { statusCode: 201 });
  }

  /**
   * Send a 204 No Content response.
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a paginated list response.
   */
  static paginated<T>(res: Response, data: T[], pagination: PaginationMeta): Response {
    return ResponseFormatter.success(res, data, { pagination });
  }

  /**
   * Send an error response.
   */
  static error(
    res: Response,
    {
      statusCode,
      code,
      message,
      details,
    }: {
      statusCode: number;
      code: string;
      message: string;
      details?: Array<{ field?: string; message: string; code?: string }>;
    },
  ): Response {
    const requestId = ResponseFormatter.getRequestId(res);

    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && details.length > 0 && { details }),
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private static getRequestId(res: Response): string {
    // pino-http sets req.id — access via res.req
    return (res.req as { id?: string } | undefined)?.id ?? crypto.randomUUID();
  }
}

/**
 * Build PaginationMeta from raw values.
 */
export function buildPaginationMeta({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate Prisma skip/take from page/limit.
 */
export function toPrismaPage(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
