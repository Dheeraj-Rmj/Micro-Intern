import { config } from "@/core/config.js";
import { createModuleLogger } from "@/core/logger.js";
import { queues } from "@/infrastructure/queue/queues.js";

import type { IEmailAuthService } from "../../application/interfaces/IEmailAuthService.js";

const log = createModuleLogger("QueueEmailAuthService");

/**
 * BullMQ-backed implementation of IEmailAuthService.
 *
 * All emails are enqueued to BullMQ and sent asynchronously by email.worker.ts.
 * This guarantees zero email latency in HTTP response paths and automatic retries on failure.
 */
export class QueueEmailAuthService implements IEmailAuthService {
  async sendWelcomeEmail(data: {
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${data.verificationToken}`;

    await queues.email.add(
      "send-welcome-email",
      {
        to: data.email,
        templateId: "welcome",
        subject: "Welcome to MicroIntern! Please verify your email",
        variables: {
          firstName: data.firstName,
          verificationUrl,
          year: new Date().getFullYear(),
          frontendUrl: config.FRONTEND_URL,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    log.info({ email: data.email }, "Enqueued welcome email");
  }

  async sendVerificationEmail(data: {
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${data.verificationToken}`;

    await queues.email.add(
      "send-verification-email",
      {
        to: data.email,
        templateId: "verify-email",
        subject: "Verify your MicroIntern email address",
        variables: {
          firstName: data.firstName,
          verificationUrl,
          year: new Date().getFullYear(),
          frontendUrl: config.FRONTEND_URL,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    log.info({ email: data.email }, "Enqueued email verification email");
  }

  async sendForgotPasswordEmail(data: {
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${data.resetToken}`;

    await queues.email.add(
      "send-forgot-password-email",
      {
        to: data.email,
        templateId: "forgot-password",
        subject: "Reset your MicroIntern password",
        variables: {
          firstName: data.firstName,
          resetUrl,
          year: new Date().getFullYear(),
          frontendUrl: config.FRONTEND_URL,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    log.info({ email: data.email }, "Enqueued forgot password email");
  }

  async sendPasswordChangedEmail(data: { email: string; firstName: string }): Promise<void> {
    await queues.email.add(
      "send-password-changed-email",
      {
        to: data.email,
        templateId: "password-changed",
        subject: "Your MicroIntern password was changed",
        variables: {
          firstName: data.firstName,
          loginUrl: `${config.FRONTEND_URL}/login`,
          supportEmail: "support@microintern.io",
          year: new Date().getFullYear(),
          frontendUrl: config.FRONTEND_URL,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    log.info({ email: data.email }, "Enqueued password changed email");
  }

  async sendInvitationEmail(data: {
    email: string;
    role: string;
    companyName?: string;
    invitationToken: string;
  }): Promise<void> {
    const invitationUrl = `${config.FRONTEND_URL}/management/invitation?token=${data.invitationToken}`;

    await queues.email.add(
      "send-invitation-email",
      {
        to: data.email,
        templateId: "invitation",
        subject: `You have been invited to MicroIntern as ${data.role}`,
        variables: {
          role: data.role,
          companyName: data.companyName ?? null,
          invitationUrl,
          year: new Date().getFullYear(),
          frontendUrl: config.FRONTEND_URL,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    log.info({ email: data.email, role: data.role }, "Enqueued invitation email");
  }
}
