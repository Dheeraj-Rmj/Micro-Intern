import { AUTH } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";

import type { IEmailAuthService } from "../interfaces/IEmailAuthService.js";
import type { IPasswordService, ISessionService } from "../interfaces/IPasswordService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

const log = createModuleLogger("PasswordResetUseCase");

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Security: Do not leak whether an account exists for this email
    if (user === null) {
      log.info({ email }, "Forgot password requested for non-existent email");
      return;
    }

    const plainToken = this.tokenService.generateSecureToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepository.createVerificationToken({
      userId: user.id,
      type: "PASSWORD_RESET",
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendForgotPasswordEmail({
      email: user.email,
      firstName: user.firstName,
      resetToken: plainToken,
    });

    log.info({ userId: user.id }, "Sent password reset email");
  }
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly sessionService: ISessionService,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(plainToken: string, newPasswordPlain: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(plainToken);

    const record = await this.userRepository.findVerificationToken({
      tokenHash,
      type: "PASSWORD_RESET",
    });

    if (record === null) {
      throw new AuthDomainError("AUTH_TOKEN_INVALID", "Invalid password reset token");
    }

    if (record.expiresAt < new Date()) {
      throw new AuthDomainError("AUTH_TOKEN_EXPIRED", "Password reset token has expired");
    }

    const user = await this.userRepository.findById(record.userId);
    if (user === null) {
      throw new AuthDomainError(
        "AUTH_TOKEN_INVALID",
        "User associated with token no longer exists",
      );
    }

    // Hash new password and update
    const newPasswordHash = await this.passwordService.hash(newPasswordPlain);
    await this.userRepository.setPasswordHash(user.id, newPasswordHash);

    // Mark token as used
    await this.userRepository.markVerificationTokenUsed(record.id);

    // Security check: revoke all active sessions when password is reset
    await this.sessionService.revokeAllSessions(user.id);

    // Notify user of password change
    await this.emailService.sendPasswordChangedEmail({
      email: user.email,
      firstName: user.firstName,
    });

    log.info({ userId: user.id }, "Password reset successfully and sessions revoked");
  }
}
