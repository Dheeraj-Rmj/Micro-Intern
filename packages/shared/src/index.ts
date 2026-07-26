// ── Enums ────────────────────────────────────────────────────────────
export { Role, ROLE_HIERARCHY, hasRoleOrHigher } from './enums/role.enum.js';
export {
  EntityStatus,
  TrialStatus,
  SubmissionStatus,
  EvaluationStatus,
  PipelineStageType,
  NotificationChannel,
  OAuthProvider,
  AIProvider,
  StorageBucket,
  AuditAction,
  CompanySize,
  PlanTier,
} from './enums/status.enum.js';

// ── Types ────────────────────────────────────────────────────────────
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  ApiResponseMeta,
  ApiError,
  ApiErrorDetail,
  PaginationMeta,
  CursorPaginationMeta,
  AuditFields,
  AuthenticatedUser,
  JwtAccessPayload,
  JwtRefreshPayload,
} from './types/api.types.js';

export { UuidSchema, IsoDateSchema } from './types/api.types.js';

// ── Schemas ──────────────────────────────────────────────────────────
export * from './schemas/pagination.schema.js';
export * from './schemas/auth.schema.js';
export * from './schemas/candidate.schema.js';
export * from './schemas/company.schema.js';

export type {
  PaginationQuery,
  CursorPaginationQuery,
  SortQuery,
  SearchQuery,
  ListQuery,
} from './schemas/pagination.schema.js';

export {
  EmailSchema,
  PasswordSchema,
  PhoneSchema,
  UrlSchema,
  SlugSchema,
  PaginationInputSchema,
  NameSchema,
  LongTextSchema,
  ShortTextSchema,
} from './schemas/common.schema.js';

export type { PaginationInput } from './schemas/common.schema.js';

// ── Error Codes ──────────────────────────────────────────────────────
export { ErrorCode } from './errors/error-codes.js';
export type { ErrorCode as ErrorCodeType } from './errors/error-codes.js';

// ── Constants ────────────────────────────────────────────────────────
export {
  APP,
  AUTH,
  PAGINATION,
  STORAGE,
  TRIAL,
  RATE_LIMITS,
  QUEUE,
  AI,
  HTTP_STATUS,
  REDIS_KEYS,
  QUEUE_NAMES,
} from './constants/index.js';
