import { z } from 'zod';

/**
 * Standard API success response envelope.
 * Every successful response from the API must conform to this shape.
 */
export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  meta: ApiResponseMeta;
};

/**
 * Standard API error response envelope.
 */
export type ApiErrorResponse = {
  success: false;
  error: ApiError;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Metadata attached to every response.
 */
export type ApiResponseMeta = {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
};

/**
 * Structured API error — always machine-parseable.
 */
export type ApiError = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  requestId: string;
  timestamp: string;
};

/**
 * Field-level validation error detail.
 */
export type ApiErrorDetail = {
  field: string;
  message: string;
  code?: string;
};

/**
 * Pagination metadata included in list responses.
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/**
 * Cursor-based pagination metadata — preferred for real-time data.
 */
export type CursorPaginationMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  previousCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/**
 * Base audit fields present on every entity.
 */
export type AuditFields = {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
};

/**
 * Authenticated user context — attached to every authenticated request.
 */
export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  sessionId: string;
};

/**
 * JWT payload structure.
 */
export type JwtAccessPayload = {
  sub: string;       // userId
  email: string;
  role: string;
  companyId: string | null;
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

export type JwtRefreshPayload = {
  sub: string;       // userId
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

/**
 * Device Session model for active sessions and login history tracking.
 */
export type DeviceSession = {
  id: string;
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  city?: string | null;
  country?: string | null;
  region?: string | null;
  userAgent?: string | null;
  isCurrent: boolean;
  isActive: boolean;
  lastActiveAt: string; // ISO 8601 string
  createdAt: string;    // ISO 8601 string
  expiresAt: string;    // ISO 8601 string
  revokedAt: string | null;
};

export type RevokeSessionResult = {
  success: boolean;
  message: string;
  revokedSessionId?: string;
  revokedCount?: number;
};

/**
 * Zod schema for UUID validation — used across all route parameters.
 */
export const UuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

/**
 * Zod schema for ISO 8601 date strings.
 */
export const IsoDateSchema = z.string().datetime({ message: 'Invalid ISO 8601 date' });
