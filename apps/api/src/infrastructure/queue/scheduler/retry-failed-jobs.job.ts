import { createModuleLogger } from "@/core/logger.js";
import { queues } from "../queues.js";

const log = createModuleLogger("RetryFailedJobsJob");

export async function retryFailedJobs(): Promise<{ retriedCount: number }> {
  log.info("Executing scheduled job: retryFailedJobs");
  let retriedCount = 0;

  for (const [name, queue] of Object.entries(queues)) {
    try {
      const failedJobs = await queue.getFailed(0, 20);
      for (const job of failedJobs) {
        if (job && job.attemptsMade < 3) {
          await job.retry();
          retriedCount++;
        }
      }
    } catch (err) {
      log.error({ err, queue: name }, "Failed to inspect or retry failed jobs in queue");
    }
  }

  log.info({ retriedCount }, "retryFailedJobs completed");
  return { retriedCount };
}
