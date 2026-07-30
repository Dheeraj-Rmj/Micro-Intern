import { config } from "dotenv";
import path from "path";

// Load env vars
config({ path: path.resolve(__dirname, "../../../.env") });

import { slackService } from "./modules/notification/infrastructure/services/SlackService";

async function testSlack() {
  try {
    console.log("Testing Slack Integration...");
    console.log("Bot Token exists:", !!process.env["SLACK_BOT_TOKEN"]);
    console.log("Channel ID:", process.env["SLACK_CHANNEL_ID"]);

    await slackService.sendMessage("🔔 *Test Alert from MicroIntern Backend*", [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 MicroIntern Slack Integration Test",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "If you are seeing this message, it means the Slack integration is **working perfectly** and successfully securely connected to your workspace!",
        },
      },
    ]);

    console.log("✅ Slack message sent successfully!");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to send Slack message:", error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

testSlack();
