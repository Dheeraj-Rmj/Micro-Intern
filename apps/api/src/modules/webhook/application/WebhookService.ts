import { createModuleLogger } from "@/core/logger.js";
import type { PrismaClient, Prisma } from "@microintern/database";

const log = createModuleLogger("WebhookService");

export type CreateWebhookDTO = {
  companyId: string;
  url: string;
  secret: string;
  events: string[];
};

export class WebhookService {
  constructor(private readonly db: PrismaClient) {}

  async createWebhook(dto: CreateWebhookDTO) {
    log.info({ companyId: dto.companyId }, "Creating webhook");
    return this.db.webhook.create({ data: dto });
  }

  async listCompanyWebhooks(companyId: string) {
    return this.db.webhook.findMany({
      where: { companyId },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.db.webhook.delete({ where: { id: webhookId } });
  }

  async toggleWebhook(webhookId: string, isActive: boolean) {
    return this.db.webhook.update({ where: { id: webhookId }, data: { isActive } });
  }

  async getDeliveries(webhookId: string) {
    return this.db.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async dispatch(
    companyId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const webhooks = await this.db.webhook.findMany({
      where: { companyId, isActive: true, events: { has: event } },
    });

    for (const webhook of webhooks) {
      void this.deliverWebhook(webhook, event, payload);
    }
  }

  private async deliverWebhook(
    webhook: { id: string; url: string; secret: string },
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload });
    const signature = await this.computeSignature(body, webhook.secret);

    let responseCode: number | undefined;
    let responseBody: string | undefined;
    let deliveredAt: Date | undefined;
    let failedAt: Date | undefined;

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MicroIntern-Signature": signature,
          "X-MicroIntern-Event": event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      responseCode = response.status;
      responseBody = await response.text().catch(() => "");

      if (response.ok) {
        deliveredAt = new Date();
        log.info({ webhookId: webhook.id, event, statusCode: responseCode }, "Webhook delivered");
      } else {
        failedAt = new Date();
        log.warn(
          { webhookId: webhook.id, event, statusCode: responseCode },
          "Webhook delivery failed (non-2xx)",
        );
      }
    } catch (err) {
      failedAt = new Date();
      responseBody = err instanceof Error ? err.message : "Network error";
      log.error({ webhookId: webhook.id, event, err }, "Webhook delivery error");
    }

    await this.db.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: payload as Prisma.InputJsonValue,
        responseCode,
        responseBody,
        deliveredAt,
        failedAt,
      },
    });
  }

  private async computeSignature(body: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(body);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    return "sha256=" + Buffer.from(sig).toString("hex");
  }
}
