import { eventBus } from "@/shared/events/EventBus.js";
import { slackService } from "../services/SlackService.js";
import { logger } from "@/core/logger.js";

/**
 * Listens to domain events and dispatches Slack notifications.
 * Decouples the SlackService from the core business logic.
 */
export function registerSlackEventListeners(): void {
  logger.info("Registering Slack event listeners");

  eventBus.on("candidate.hired", async (payload: any) => {
    await slackService.sendCandidateHiredNotification(payload);
  });

  eventBus.on("candidate.created", async (payload: any) => {
    await slackService.sendCandidateCreatedNotification(payload);
  });

  eventBus.on("interview.completed", async (payload: any) => {
    await slackService.sendInterviewCompletedNotification(payload);
  });

  // Additional Phase 10 events can be added here
}
