import { QUEUE_NAMES } from "@microintern/shared";
import { createModuleLogger } from "@/core/logger.js";
import { getContainer } from "@/core/container.js";

import { createWorker, type AIEvaluationJobData } from "../queues.js";
import type { Job } from "bullmq";
import type { ProcessEvaluationUseCase } from "@/modules/evaluation/application/use-cases/process-evaluation.usecase.js";

const log = createModuleLogger("EvaluationWorker");

export function startEvaluationWorker() {
  const worker = createWorker<AIEvaluationJobData>(
    QUEUE_NAMES.AI_EVALUATION,
    async (job: Job<AIEvaluationJobData>) => {
      const { submissionId, assessmentId, candidateId } = job.data;
      log.info({ jobId: job.id, submissionId, assessmentId, candidateId }, "Processing Evaluation AI job");

      const container = getContainer();
      
      let processEvaluationUseCase: ProcessEvaluationUseCase;
      try {
        processEvaluationUseCase = container.get<ProcessEvaluationUseCase>("ProcessEvaluationUseCase");
      } catch (err) {
        log.error("ProcessEvaluationUseCase not registered in DI container");
        throw err;
      }

      await processEvaluationUseCase.execute(submissionId);

      log.info({ jobId: job.id, submissionId }, "Evaluation AI job completed successfully");
    },
    {
      concurrency: 5,
    },
  );

  worker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, error: err.message }, "Evaluation worker job failed");
  });

  return worker;
}
