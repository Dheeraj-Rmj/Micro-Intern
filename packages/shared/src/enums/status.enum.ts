/**
 * Generic entity lifecycle status.
 * Applied to users, companies, trials, etc.
 */
export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Skill trial status — lifecycle of a trial definition.
 */
export enum TrialStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Trial submission status — lifecycle of a candidate's trial attempt.
 */
export enum SubmissionStatus {
  INVITED = 'INVITED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  UNDER_EVALUATION = 'UNDER_EVALUATION',
  EVALUATION_COMPLETE = 'EVALUATION_COMPLETE',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
}

/**
 * AI evaluation status.
 */
export enum EvaluationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REQUIRES_HUMAN_REVIEW = 'REQUIRES_HUMAN_REVIEW',
}

/**
 * Hiring pipeline stage types.
 */
export enum PipelineStageType {
  SCREENING = 'SCREENING',
  SKILL_TRIAL = 'SKILL_TRIAL',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  CULTURE_FIT = 'CULTURE_FIT',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * Notification channels.
 */
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

/**
 * OAuth providers supported by the platform.
 */
export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

/**
 * AI provider identifiers — used by the AI Gateway.
 */
export enum AIProvider {
  GROQ = 'groq',
  OPENROUTER = 'openrouter',
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
  HUGGINGFACE = 'huggingface',
}

/**
 * Storage bucket types.
 */
export enum StorageBucket {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

/**
 * Audit action types — used in the immutable audit log.
 */
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  INVITATION_SENT = 'INVITATION_SENT',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  TRIAL_SUBMITTED = 'TRIAL_SUBMITTED',
  EVALUATION_STARTED = 'EVALUATION_STARTED',
  EVALUATION_COMPLETED = 'EVALUATION_COMPLETED',
}
