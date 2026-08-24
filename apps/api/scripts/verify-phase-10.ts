import { config } from "dotenv";
import * as path from "path";
config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "@microintern/database";
import { DomainEventDispatcher } from "../src/core/events/DomainEventDispatcher.js";
import { SlackService } from "../src/modules/integrations/slack/SlackService.js";
import { WebhookService } from "../src/modules/webhook/application/WebhookService.js";

// We can just use the shared prisma instance

async function main() {
  console.log("--- Phase 10 Infrastructure Verification ---");

  // 1. Verify Database
  console.log("\n1. Verifying Database Connection...");
  try {
    await prisma.$connect();
    console.log("✅ Database connected.");
  } catch (e) {
    console.error("❌ Database connection failed:", e);
  }

  // 2. Verify Env
  console.log("\n2. Verifying Environment Variables...");
  const envVars = [
    "SLACK_BOT_TOKEN",
    "SLACK_CHANNEL_ID",
    "SLACK_SIGNING_SECRET",
    "WEBHOOK_SECRET",
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
  ];
  for (const v of envVars) {
    if (process.env[v]) {
      console.log(`✅ ${v} is set`);
    } else {
      console.log(`❌ ${v} is MISSING`);
    }
  }

  // 3. Test Slack Service (Directly)
  console.log("\n3. Testing Slack Service (Directly)...");
  const slackService = new SlackService(prisma);
  try {
    console.log("Configuring mock Slack integration...");
    await slackService.configureIntegration(
      "123e4567-e89b-12d3-a456-426614174000",
      "https://httpbin.org/post", // Dummy URL to test network dispatch
      "#general",
      ["CANDIDATE_HIRED"],
    );

    console.log("Sending test message to Slack...");
    await slackService.notify("123e4567-e89b-12d3-a456-426614174000", "CANDIDATE_HIRED", {
      candidateId: "test-123",
      newStatus: "HIRED",
      candidateName: "Jane Doe",
      roleName: "Software Engineer",
    });
    console.log("✅ Slack notify function executed. Check logs for network dispatch info.");
  } catch (e) {
    console.error("❌ Slack notification failed:", e);
  }

  // 4. Test Webhook Service
  console.log("\n4. Testing Webhook Service (Directly)...");
  const webhookService = new WebhookService(prisma);
  try {
    console.log("Dispatching webhook for test company...");
    // We expect this to fail gracefully or not do anything since there's no webhook registered for this company
    await webhookService.dispatch("123e4567-e89b-12d3-a456-426614174000", "CANDIDATE_HIRED", {
      test: true,
    });
    console.log("✅ Webhook dispatch executed without crashing.");
  } catch (e) {
    console.error("❌ Webhook dispatch failed:", e);
  }

  console.log("\nVerification complete.");
  await prisma.$disconnect();
}

main().catch(console.error);
