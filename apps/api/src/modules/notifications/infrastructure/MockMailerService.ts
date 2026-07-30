import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("MockMailerService");

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  type?: "RECOVERY_REPORT" | "INTERVIEW_INVITE" | "RECRUITER_ALERT";
}

export interface IMailerService {
  sendEmail(params: SendEmailParams): Promise<void>;
}

export class MockMailerService implements IMailerService {
  async sendEmail(params: SendEmailParams): Promise<void> {
    const separator = "==================================================";
    log.info(
      `\n${separator}\n📧 MOCK EMAIL SENT [${params.type || "GENERAL"}]\nTo: ${params.to}\nSubject: ${params.subject}\n\n${params.body}\n${separator}\n`,
    );
    // In production, this would integrate with SendGrid, AWS SES, or Resend.
  }
}
