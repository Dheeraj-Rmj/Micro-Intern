import { QUEUE_NAMES, QUEUE } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { getEmailService } from "@/infrastructure/email/EmailService.js";
import { createWorker, type EmailJobData } from "@/infrastructure/queue/queues.js";

import type { Worker } from "bullmq";

const log = createModuleLogger("EmailWorker");

/**
 * Email Queue Worker — BullMQ Consumer.
 *
 * Consumes email jobs from the Redis queue and sends them using EmailService (Nodemailer + Handlebars).
 * Supports both development (MailHog SMTP) and production (Resend API / SMTP).
 */
export function startEmailWorker(): Worker<EmailJobData> {
  const emailService = getEmailService();

  const worker = createWorker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job) => {
      const { to, templateId, variables, subject } = job.data;

      log.info({ jobId: job.id, to, templateId }, "Processing email job");

      await emailService.sendTemplated({
        to,
        templateId,
        subject: subject ?? "Notification from MicroIntern",
        variables,
      });

      log.info({ jobId: job.id, to, templateId }, "Email sent successfully");
    },
    {
      concurrency: QUEUE.EMAIL_CONCURRENCY,
    },
  );

  return worker;
}
