import { eventBus } from "@/shared/events/EventBus.js";
import { queues } from "@/infrastructure/queue/queues.js";
import { prisma } from "@/core/database.js";
import { logger } from "@/core/logger.js";
import { DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

/**
 * Listens to domain events and queues them for webhook delivery.
 */
export function registerWebhookEventListeners(): void {
  logger.info("Registering Webhook event listeners");

  const eventsToWatch = [
    DOMAIN_EVENTS.CANDIDATE_CREATED,
    DOMAIN_EVENTS.CANDIDATE_REJECTED,
    DOMAIN_EVENTS.CANDIDATE_HIRED,
    DOMAIN_EVENTS.CANDIDATE_JOURNEY_STATUS_CHANGED,
    DOMAIN_EVENTS.INTERVIEW_COMPLETED,
    DOMAIN_EVENTS.REFERRAL_CREATED,
    DOMAIN_EVENTS.AI_ANALYSIS_COMPLETED,
  ];

  eventsToWatch.forEach((eventName) => {
    eventBus.on(eventName, async (payload: any) => {
      try {
        // Fetch all active webhooks subscribed to this event
        const webhooks = await prisma.webhook.findMany({
          where: {
            isActive: true,
            events: {
              has: eventName,
            },
          },
        });

        if (webhooks.length === 0) return;

        // Queue a delivery job for each webhook
        const jobs = webhooks.map((webhook) => ({
          name: "deliver-webhook",
          data: {
            webhookId: webhook.id,
            event: eventName,
            payload,
          },
        }));

        await queues.webhookDelivery.addBulk(jobs);
        logger.debug({ event: eventName, count: jobs.length }, "Queued webhook deliveries");
      } catch (error) {
        logger.error({ err: error, event: eventName }, "Failed to queue webhook delivery");
      }
    });
  });
}
