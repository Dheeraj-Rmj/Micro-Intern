import crypto from "node:crypto";
import axios from "axios";
import { config } from "@/core/config.js";
import { logger } from "@/core/logger.js";
import { prisma } from "@/core/database.js";

export class WebhookDispatcher {
  /**
   * Generates HMAC SHA-256 signature for webhook payload.
   */
  private generateSignature(payload: string, secret: string, timestamp: string): string {
    const signaturePayload = `${timestamp}.${payload}`;
    return crypto.createHmac("sha256", secret).update(signaturePayload).digest("hex");
  }

  /**
   * Dispatches a single webhook delivery with retries managed by BullMQ.
   */
  async dispatch(
    webhookId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      logger.debug({ webhookId }, "Webhook not found or inactive, skipping dispatch");
      return;
    }

    const secret = webhook.secret || config.WEBHOOK_SECRET;
    if (!secret) {
      logger.warn({ webhookId }, "Webhook secret missing, delivery aborted");
      throw new Error("WEBHOOK_SECRET missing");
    }

    const payloadString = JSON.stringify(payload);
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(payloadString, secret, timestamp);

    let responseCode: number | null = null;
    let success = false;

    try {
      logger.info({ webhookId, url: webhook.url }, "Sending webhook delivery");
      const response = await axios.post(webhook.url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": `t=${timestamp},v1=${signature}`,
          "x-webhook-event": event,
        },
        timeout: 5000,
      });

      responseCode = response.status;
      success = responseCode >= 200 && responseCode < 300;
    } catch (error: any) {
      responseCode = error.response?.status || 500;
      logger.error({ webhookId, err: error.message }, "Webhook delivery failed");
      throw error; // Let BullMQ handle retries
    } finally {
      // Log the delivery attempt in database
      await prisma.webhookDelivery.create({
        data: {
          webhookId,
          event,
          payload: payload as any,
          responseCode: responseCode ?? 0,
          success,
          attempts: 1, // BullMQ manages actual attempt count tracking via job, but we record the DB entry
        },
      });
    }
  }
}

export const webhookDispatcher = new WebhookDispatcher();
