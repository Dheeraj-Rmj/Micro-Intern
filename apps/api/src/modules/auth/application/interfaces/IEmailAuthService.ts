/**
 * Email Auth Service Interface — application layer contract.
 *
 * Defines transactional emails required by the authentication and onboarding lifecycle.
 * The implementation (BullMQ queue producer or synchronous EmailService) lives in infrastructure.
 */
export interface IEmailAuthService {
  sendWelcomeEmail(data: {
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void>;

  sendVerificationEmail(data: {
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void>;

  sendForgotPasswordEmail(data: {
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<void>;

  sendPasswordChangedEmail(data: { email: string; firstName: string }): Promise<void>;

  sendInvitationEmail(data: {
    email: string;
    role: string;
    companyName?: string;
    invitationToken: string;
  }): Promise<void>;
}
