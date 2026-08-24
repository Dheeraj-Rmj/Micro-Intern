import { AUTH } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";
import { NotFoundError } from "@/shared/errors/index.js";

import type { IEmailAuthService } from "../interfaces/IEmailAuthService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

const log = createModuleLogger("EmailVerificationUseCase");

export class SendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError("User", userId);
    }

    if (user.emailVerifiedAt !== null) {
      log.info({ userId }, "User email already verified, skipping verification email");
      return;
    }

    const plainToken = this.tokenService.generateSecureToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + AUTH.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.userRepository.createVerificationToken({
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationToken: plainToken,
    });

    log.info({ userId }, "Sent verification email");
  }
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(plainToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(plainToken);

    const record = await this.userRepository.findVerificationToken({
      tokenHash,
      type: "EMAIL_VERIFICATION",
    });

    if (record === null) {
      throw new AuthDomainError("AUTH_TOKEN_INVALID", "Invalid verification token");
    }

    if (record.expiresAt < new Date()) {
      throw new AuthDomainError("AUTH_TOKEN_EXPIRED", "Verification token has expired");
    }

    await this.userRepository.markVerificationTokenUsed(record.id);
    await this.userRepository.setEmailVerified(record.userId);

    log.info({ userId: record.userId }, "Email successfully verified");
  }
}

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Don't leak user existence — silently succeed if not found
    if (user === null) {
      log.warn({ email }, "Resend verification requested for non-existent email");
      return;
    }

    if (user.emailVerifiedAt !== null) {
      log.info({ userId: user.id }, "Resend verification requested for already verified account");
      return;
    }

    const plainToken = this.tokenService.generateSecureToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + AUTH.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.userRepository.createVerificationToken({
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationToken: plainToken,
    });

    log.info({ userId: user.id }, "Resent verification email");
  }
}
