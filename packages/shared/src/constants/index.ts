/**
 * Platform-wide constants.
 * All magic numbers and strings live here — never inline them.
 */

export const APP = {
  NAME: 'MicroIntern',
  VERSION: '0.1.0',
  DESCRIPTION: 'AI-Powered Skill Trial Platform',
  SUPPORT_EMAIL: 'support@microintern.io',
  WEBSITE_URL: 'https://microintern.io',
} as const;

export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY_SECONDS: 60 * 60 * 24 * 7, // 7 days
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_RESET_EXPIRY_MINUTES: 60,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  INVITATION_EXPIRY_DAYS: 7,
  BCRYPT_ROUNDS: 12,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const STORAGE = {
  MAX_AVATAR_SIZE_MB: 5,
  MAX_RESUME_SIZE_MB: 10,
  MAX_SUBMISSION_FILE_SIZE_MB: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SIGNED_URL_EXPIRY_SECONDS: 3600,
} as const;

export const TRIAL = {
  MAX_DURATION_HOURS: 72,
  MIN_DURATION_MINUTES: 30,
  MAX_TASKS_PER_TRIAL: 20,
  MIN_PASSING_SCORE: 0,
  MAX_PASSING_SCORE: 100,
  DEFAULT_PASSING_SCORE: 70,
} as const;

export const RATE_LIMITS = {
  GLOBAL_REQUESTS_PER_MINUTE: 100,
  AUTH_REQUESTS_PER_MINUTE: 10,
  AI_REQUESTS_PER_MINUTE: 20,
  UPLOAD_REQUESTS_PER_MINUTE: 10,
} as const;

export const QUEUE = {
  EMAIL_CONCURRENCY: 5,
  AI_EVALUATION_CONCURRENCY: 2,
  NOTIFICATION_CONCURRENCY: 10,
  STORAGE_PROCESSING_CONCURRENCY: 5,
  DEFAULT_JOB_ATTEMPTS: 3,
  DEFAULT_BACKOFF_DELAY_MS: 5000,
} as const;

export const AI = {
  DEFAULT_MAX_TOKENS: 8192,
  DEFAULT_TEMPERATURE: 0.1,  // Low temperature for evaluation tasks (determinism)
  EVALUATION_TEMPERATURE: 0.1,
  GENERATION_TEMPERATURE: 0.7,
  DEFAULT_TIMEOUT_MS: 30_000,
  MAX_RETRIES: 3,
  RETRY_BACKOFF_MS: 2000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const REDIS_KEYS = {
  refreshToken: (userId: string, sessionId: string) =>
    `auth:refresh:${userId}:${sessionId}`,
  userSessions: (userId: string) => `auth:sessions:${userId}`,
  rateLimitGlobal: (ip: string) => `rl:global:${ip}`,
  rateLimitAuth: (ip: string) => `rl:auth:${ip}`,
  rateLimitUser: (userId: string) => `rl:user:${userId}`,
  emailVerification: (token: string) => `auth:email-verify:${token}`,
  passwordReset: (token: string) => `auth:password-reset:${token}`,
  aiProviderHealth: (provider: string) => `ai:health:${provider}`,
} as const;

export const QUEUE_NAMES = {
  EMAIL: 'email',
  AI_EVALUATION: 'ai-evaluation',
  NOTIFICATION: 'notification',
  STORAGE_PROCESSING: 'storage-processing',
  AUDIT: 'audit',
  RESUME_PARSER: 'resume-parser',
} as const;
