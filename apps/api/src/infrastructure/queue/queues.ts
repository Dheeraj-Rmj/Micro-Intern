import { QUEUE_NAMES } from "@microintern/shared";
import { Queue, Worker, type Job, type WorkerOptions } from "bullmq";

import { createModuleLogger } from "@/core/logger.js";
import { createRedisClient } from "@/core/redis.js";

const log = createModuleLogger("QueueRegistry");

/**
 * BullMQ connection options.
 * maxRetriesPerRequest: null is REQUIRED for BullMQ connections.
 */
const bullMQConnection = () => createRedisClient({ maxRetriesPerRequest: null });

/**
 * Default job options applied to all queues.
 */
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 5000, // 5s initial, then 10s, 20s
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24h
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days (for debugging)
  },
};

/**
 * Queue registry — single source of truth for all BullMQ queues.
 *
 * Each queue has:
 * - A typed Queue instance for adding jobs
 * - Shared connection with maxRetriesPerRequest: null (BullMQ requirement)
 * - Standard retry and retention policies
 */
export const queues = {
  email: new Queue(QUEUE_NAMES.EMAIL, {
    connection: bullMQConnection(),
    defaultJobOptions,
  }),

  aiEvaluation: new Queue(QUEUE_NAMES.AI_EVALUATION, {
    connection: bullMQConnection(),
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 2, // AI evaluations get fewer retries (expensive)
    },
  }),

  notification: new Queue(QUEUE_NAMES.NOTIFICATION, {
    connection: bullMQConnection(),
    defaultJobOptions,
  }),

  storageProcessing: new Queue(QUEUE_NAMES.STORAGE_PROCESSING, {
    connection: bullMQConnection(),
    defaultJobOptions,
  }),

  audit: new Queue(QUEUE_NAMES.AUDIT, {
    connection: bullMQConnection(),
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 5, // Audit logs are critical — more retries
    },
  }),

  assessmentAi: new Queue(QUEUE_NAMES.ASSESSMENT_AI, {
    connection: bullMQConnection(),
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 2,
    },
  }),

  resumeParser: new Queue(QUEUE_NAMES.RESUME_PARSER, {
    connection: bullMQConnection(),
    defaultJobOptions,
  }),

  webhookDelivery: new Queue(QUEUE_NAMES.WEBHOOK_DELIVERY, {
    connection: bullMQConnection(),
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 5, // Exponential retry is important for webhooks
    },
  }),
};

/**
 * Base worker factory.
 * Feature teams call this to create typed workers for their queues.
 *
 * @example
 * const emailWorker = createWorker(
 *   QUEUE_NAMES.EMAIL,
 *   async (job) => { await sendEmail(job.data); },
 *   { concurrency: config.QUEUE_CONCURRENCY_EMAIL },
 * );
 */
export function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>,
  options?: Partial<WorkerOptions>,
): Worker<T> {
  const worker = new Worker<T>(queueName, processor, {
    connection: bullMQConnection(),
    concurrency: 5,
    ...options,
  });

  worker.on("completed", (job) => {
    log.info({ queue: queueName, jobId: job.id }, "Job completed");
  });

  worker.on("failed", (job, error) => {
    log.error(
      { queue: queueName, jobId: job?.id, err: error, attempts: job?.attemptsMade },
      "Job failed",
    );
  });

  worker.on("stalled", (jobId) => {
    log.warn({ queue: queueName, jobId }, "Job stalled");
  });

  log.info({ queue: queueName }, "Worker started");
  return worker;
}

/**
 * Type-safe job data interfaces — one per queue.
 * Feature teams extend these as needed.
 */

export type EmailJobData = {
  to: string;
  templateId: string;
  variables: Record<string, unknown>;
  subject?: string;
};

export type AIEvaluationJobData = {
  submissionId: string;
  assessmentId: string;
  candidateId: string;
};

export type NotificationJobData = {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export type StorageProcessingJobData = {
  fileKey: string;
  bucket: string;
  operation: "thumbnail" | "virus-scan" | "compress";
};

export type AuditJobData = {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
};

export type AssessmentAIJobData = {
  assessmentId: string;
  recruiterId: string;
  action:
    | "GENERATE_ASSESSMENT"
    | "IMPROVE_ASSESSMENT"
    | "REWRITE_INSTRUCTIONS"
    | "GENERATE_RUBRIC"
    | "SUGGEST_SKILLS"
    | "SUGGEST_DELIVERABLES"
    | "ESTIMATE_DIFFICULTY"
    | "ESTIMATE_DURATION"
    | "SUGGEST_LEARNING_OUTCOMES"
    | "GENERATE_INTERVIEW_QUESTIONS"
    | "GENERATE_EVALUATION_NOTES";
  input: Record<string, unknown>;
};

export type WebhookDeliveryJobData = {
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
};

export type ResumeParserJobData = {
  candidateId: string;
  fileUrl: string;
  fileText?: string;
};
