import { QUEUE_NAMES } from "@microintern/shared";

import { getContainer } from "@/core/container.js";
import { createModuleLogger } from "@/core/logger.js";
import { createWorker, type AIEvaluationJobData } from "@/infrastructure/queue/queues.js";

import type { ProcessEvaluationUseCase } from "../../application/use-cases/process-evaluation.usecase.js";
import type { Worker } from "bullmq";

const log = createModuleLogger("AIEvaluationWorker");

let workerInstance: Worker<AIEvaluationJobData> | null = null;

export function initAIEvaluationWorker(): Worker<AIEvaluationJobData> {
  if (workerInstance) return workerInstance;

  log.info(
    { queue: QUEUE_NAMES.AI_EVALUATION },
    "Initializing BullMQ AI Evaluation Background Worker",
  );

  workerInstance = createWorker<AIEvaluationJobData>(
    QUEUE_NAMES.AI_EVALUATION,
    async (job) => {
      log.info(
        { jobId: job.id, submissionId: job.data.submissionId },
        "Processing AI evaluation job from BullMQ",
      );
      const container = getContainer();
      const processEvaluationUseCase = container.get<ProcessEvaluationUseCase>(
        "ProcessEvaluationUseCase",
      );
      await processEvaluationUseCase.execute(job.data.submissionId);
    },
    { concurrency: 5 },
  );

  return workerInstance;
}
