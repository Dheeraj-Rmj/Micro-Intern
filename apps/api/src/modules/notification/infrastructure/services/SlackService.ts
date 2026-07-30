import { WebClient } from "@slack/web-api";
import { config } from "@/core/config.js";
import { logger } from "@/core/logger.js";

export class SlackService {
  private client: WebClient | null = null;
  private channelId: string | null = null;

  constructor() {
    if (config.SLACK_BOT_TOKEN) {
      this.client = new WebClient(config.SLACK_BOT_TOKEN);
      this.channelId = config.SLACK_CHANNEL_ID || null;
      logger.info("SlackService initialized");
    } else {
      logger.warn("SlackService not initialized: SLACK_BOT_TOKEN missing");
    }
  }

  /**
   * Sends a structured message block to the configured Slack channel.
   */
  async sendMessage(text: string, blocks?: any[]): Promise<void> {
    if (!this.client || !this.channelId) {
      logger.debug("Skipping Slack message, service not configured");
      return;
    }

    try {
      await this.client.chat.postMessage({
        channel: this.channelId,
        text,
        blocks,
      });
      logger.info("Slack message sent successfully");
    } catch (error) {
      logger.error({ err: error }, "Failed to send Slack message");
    }
  }

  async sendCandidateHiredNotification(payload: any): Promise<void> {
    const text = `🎉 Candidate Hired: ${payload.candidateId}`;
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🎉 New Hire Alert!*\nA candidate has been successfully hired.\n*Candidate ID:* ${payload.candidateId}`,
        },
      },
    ];
    await this.sendMessage(text, blocks);
  }

  async sendCandidateCreatedNotification(payload: any): Promise<void> {
    const text = `👤 New Candidate Created: ${payload.candidateId}`;
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*👤 New Candidate Profile!*\nA new candidate has created a profile.\n*Candidate ID:* ${payload.candidateId}`,
        },
      },
    ];
    await this.sendMessage(text, blocks);
  }

  async sendInterviewCompletedNotification(payload: any): Promise<void> {
    const text = `🎥 Interview Completed: ${payload.sessionId}`;
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🎥 Interview Completed!*\nAn interview session has been completed.\n*Session ID:* ${payload.sessionId}`,
        },
      },
    ];
    await this.sendMessage(text, blocks);
  }
}

export const slackService = new SlackService();
