import { corsOrigins } from "@/core/config.js";
import { createModuleLogger } from "@/core/logger.js";
import { getEmailService } from "@/infrastructure/email/EmailService.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import type { DomainEvent } from "@/shared/events/EventBus.js";

const log = createModuleLogger("CompanyEventListener");

interface CompanyMemberInvitedPayload {
  companyId: string;
  companyName: string;
  invitedByUserId: string;
  email: string;
  role: string;
  memberId: string;
}

/**
 * Registers domain event listeners for the Company module.
 * De-couples core application commands from email notifications and background actions.
 */
export function registerCompanyEventListeners(): void {
  eventBus.on(DOMAIN_EVENTS.COMPANY_MEMBER_INVITED, async (event: DomainEvent<unknown>) => {
    const payload = event.payload as CompanyMemberInvitedPayload;
    log.info(
      { email: payload.email, companyName: payload.companyName },
      "Received COMPANY_MEMBER_INVITED event, sending email",
    );
    try {
      const emailService = getEmailService();
      const clientUrl = corsOrigins[0] ?? "http://localhost:3000";
      const inviteUrl = `${clientUrl}/auth/register?invite=${payload.memberId}&email=${encodeURIComponent(payload.email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">You've been invited to join ${payload.companyName}!</h2>
          <p>You have been invited to join <strong>${payload.companyName}</strong> as a recruiter on MicroIntern.</p>
          <p>Click the link below to accept your invitation, complete your profile, and access the employer dashboard:</p>
          <p style="margin: 28px 0;">
            <a href="${inviteUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="font-size: 0.9em; color: #666;">If the button above does not work, copy and paste this URL directly into your browser:<br/><a href="${inviteUrl}" style="color: #4F46E5; word-break: break-all;">${inviteUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 0.8em; color: #999;">MicroIntern Hiring Platform</p>
        </div>
      `;

      await emailService.send({
        to: payload.email,
        subject: `You have been invited to join ${payload.companyName} on MicroIntern`,
        html,
      });

      log.info({ email: payload.email }, "Invitation email sent successfully");
    } catch (err) {
      log.error({ err, email: payload.email }, "Failed to send invitation email");
    }
  });

  log.info("Company event listeners registered successfully");
}
