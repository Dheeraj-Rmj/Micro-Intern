import { config } from "dotenv";
import path from "path";

// Load env vars from the root .env file
config({ path: path.resolve(__dirname, "../../../.env") });

import { eventBus, DOMAIN_EVENTS } from "../src/shared/events/EventBus";
import { registerSlackEventListeners } from "../src/modules/notification/infrastructure/listeners/SlackEventListener"; // Boot the listener
import { registerWebhookEventListeners } from "../src/modules/webhook/infrastructure/listeners/WebhookEventListener"; // Boot the listener

registerSlackEventListeners();
registerWebhookEventListeners();

async function runEndToEndTest() {
  console.log("🚀 Triggering End-to-End Background Events Test...");

  const mockCandidateEvent = {
    candidateId: "test-uuid-1234",
    jobId: "job-uuid-5678",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    status: "applied",
    companyId: "company-uuid-0000", // Assuming webhooks might filter by this later
    timestamp: new Date(),
  };

  // Emit the event to the centralized event bus
  // This should trigger the Slack alert and schedule the BullMQ Webhook delivery
  console.log(`\n📡 Emitting [${DOMAIN_EVENTS.CANDIDATE_CREATED}] event...`);
  eventBus.emit(DOMAIN_EVENTS.CANDIDATE_CREATED, mockCandidateEvent);

  console.log("\n✅ Event emitted successfully!");
  console.log("You should now see:");
  console.log("1. A new message in your Slack #general channel.");
  console.log(
    "2. The WebhookWorker picking up the job and logging delivery attempts in your server terminal.",
  );

  // Wait a few seconds to let async event handlers fire before exiting
  setTimeout(() => {
    console.log("🏁 Test script finished.");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  }, 3000);
}

runEndToEndTest();
