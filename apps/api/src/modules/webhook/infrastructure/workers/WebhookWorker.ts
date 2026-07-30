import { QUEUE_NAMES } from "@microintern/shared";
import { createWorker, type WebhookDeliveryJobData } from "@/infrastructure/queue/queues.js";
import { webhookDispatcher } from "../../application/services/WebhookDispatcher.js";

/**
 * BullMQ worker for processing webhook delivery jobs.
 */
import { Worker } from "bullmq";

let workerInstance: Worker<WebhookDeliveryJobData> | null = null;

export function initWebhookWorker(): Worker<WebhookDeliveryJobData> {
  if (workerInstance) return workerInstance;

  workerInstance = createWorker<WebhookDeliveryJobData>(
    QUEUE_NAMES.WEBHOOK_DELIVERY,
    async (job) => {
      const { webhookId, event, payload } = job.data;
      await webhookDispatcher.dispatch(webhookId, event, payload);
    },
    { concurrency: 5 },
  );

  return workerInstance;
}
