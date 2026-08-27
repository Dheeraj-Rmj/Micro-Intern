import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import Handlebars from "handlebars";
import nodemailer from "nodemailer";

import { config } from "@/core/config.js";
import { createModuleLogger } from "@/core/logger.js";

import type { Transporter, SendMailOptions } from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = createModuleLogger("EmailService");

const TEMPLATES_DIR = join(__dirname, "templates");

/**
 * Email Service — Nodemailer with Handlebars templating.
 *
 * Transport selection:
 * - smtp: Used in development (MailHog) and production (Resend SMTP)
 * - resend: Direct Resend API (faster, better analytics)
 *
 * All emails use Handlebars HTML templates.
 * Template cache prevents re-reading files on every send.
 */
export class EmailService {
  private readonly transporter: Transporter;
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private readonly templatesDir = TEMPLATES_DIR;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): Transporter {
    return nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth:
        config.SMTP_USER !== undefined && config.SMTP_PASS !== undefined
          ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
          : undefined,
    });
  }

  /**
   * Send a templated email.
   */
  async sendTemplated<T extends Record<string, unknown>>(options: {
    to: string | string[];
    subject: string;
    templateId: string;
    variables: T;
    replyTo?: string;
  }): Promise<void> {
    const html = await this.renderTemplate(options.templateId, options.variables);

    await this.send({
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html,
      replyTo: options.replyTo,
    });
  }

  /**
   * Send a raw email (for simple transactional messages).
   */
  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? this.stripHtml(options.html),
      replyTo: options.replyTo,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      log.info({ messageId: info.messageId, to: options.to }, "Email sent");
    } catch (error) {
      log.error({ err: error, to: options.to }, "Email send failed");
      throw error;
    }
  }

  /**
   * Verify SMTP connection — used in health checks.
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  private async renderTemplate<T extends Record<string, unknown>>(
    templateId: string,
    variables: T,
  ): Promise<string> {
    let template = this.templateCache.get(templateId);

    if (template === undefined) {
      const templatePath = join(TEMPLATES_DIR, `${templateId}.hbs`);
      const source = await readFile(templatePath, "utf-8");
      template = Handlebars.compile(source);
      this.templateCache.set(templateId, template);
    }

    return template(variables);
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (emailService === null) {
    emailService = new EmailService();
  }
  return emailService;
}
