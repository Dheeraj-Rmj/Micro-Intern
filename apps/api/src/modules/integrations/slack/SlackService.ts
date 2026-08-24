import { createModuleLogger } from "@/core/logger.js";
import type { PrismaClient } from "@microintern/database";

const log = createModuleLogger("SlackService");

const SLACK_EVENT_TEMPLATES: Record<string, (payload: any) => object> = {
  CANDIDATE_APPLIED: (p) => ({
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🎯 New Application Received", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Candidate:*\n${p.candidateName}` },
          { type: "mrkdwn", text: `*Role:*\n${p.roleName}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Skill Match:* ${p.skillMatch ?? "Calculating..."}%` },
      },
      { type: "divider" },
    ],
  }),
  ASSESSMENT_SUBMITTED: (p) => ({
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "📝 Assessment Submitted", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Candidate:*\n${p.candidateName}` },
          { type: "mrkdwn", text: `*Assessment:*\n${p.assessmentTitle}` },
        ],
      },
      { type: "section", text: { type: "mrkdwn", text: "⏳ AI Evaluation in progress..." } },
    ],
  }),
  CANDIDATE_HIRED: (p) => ({
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🎉 Candidate Hired!", emoji: true } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Candidate:*\n${p.candidateName}` },
          { type: "mrkdwn", text: `*Role:*\n${p.roleName}` },
        ],
      },
    ],
  }),
  CANDIDATE_REJECTED: (p) => ({
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "❌ Application Status Updated", emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Candidate *${p.candidateName}* was not selected for *${p.roleName}*.`,
        },
      },
    ],
  }),
  INTERVIEW_SUBMITTED: (p) => ({
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🤖 AI Interview Submitted", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Candidate:*\n${p.candidateName}` },
          { type: "mrkdwn", text: `*Interview:*\n${p.interviewTitle}` },
        ],
      },
    ],
  }),
};

export class SlackService {
  constructor(private readonly db: PrismaClient) {}

  async configureIntegration(
    companyId: string,
    webhookUrl: string,
    channelName: string,
    events: string[],
  ) {
    return this.db.slackIntegration.upsert({
      where: { companyId },
      create: { companyId, webhookUrl, channelName, events },
      update: { webhookUrl, channelName, events, isActive: true },
    });
  }

  async getIntegration(companyId: string) {
    return this.db.slackIntegration.findUnique({ where: { companyId } });
  }

  async deleteIntegration(companyId: string) {
    return this.db.slackIntegration.delete({ where: { companyId } });
  }

  async notify(companyId: string, event: string, payload: Record<string, unknown>): Promise<void> {
    const integration = await this.db.slackIntegration.findUnique({
      where: { companyId, isActive: true },
    });

    if (!integration || !integration.events.includes(event)) return;

    const template = SLACK_EVENT_TEMPLATES[event];
    const body = template
      ? template(payload)
      : {
          text: `*MicroIntern Event:* ${event}\n${JSON.stringify(payload, null, 2)}`,
        };

    try {
      const resp = await fetch(integration.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8_000),
      });

      if (!resp.ok) {
        log.warn({ companyId, event, status: resp.status }, "Slack notification failed");
      } else {
        log.info({ companyId, event }, "Slack notification sent");
      }
    } catch (err) {
      log.error({ companyId, event, err }, "Slack notification error");
    }
  }
}
