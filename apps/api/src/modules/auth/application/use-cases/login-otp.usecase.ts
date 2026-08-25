import { createModuleLogger } from "@/core/logger.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";
import { UnauthorizedError } from "@/shared/errors/index.js";

import type { IEmailAuthService } from "../interfaces/IEmailAuthService.js";
import type { IJwtService } from "../interfaces/IJwtService.js";
import type { ISessionService } from "../interfaces/ISessionService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { LoginResponse } from "../dtos/auth.dto.js";
import type { ParsedDeviceInfo } from "@/shared/utils/device-parser.js";

const log = createModuleLogger("LoginOtpUseCase");

export class RequestLoginOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Security: Do not leak whether an account exists for this email
    if (user === null) {
      log.info({ email }, "Login OTP requested for non-existent email");
      return;
    }

    if (user.status === "SUSPENDED") {
      log.warn({ email }, "Login OTP requested for suspended account");
      return;
    }

    const plainToken = this.tokenService.generateOtpToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing unused LOGIN_OTP tokens for this user first
    // Note: If you don't have a specific method for this, it's fine, createVerificationToken handles creation.
    await this.userRepository.createVerificationToken({
      userId: user.id,
      type: "LOGIN_OTP",
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendLoginOtpEmail({
      email: user.email,
      firstName: user.firstName,
      otp: plainToken,
    });

    log.info({ userId: user.id }, "Sent login OTP email");
  }
}

export class VerifyLoginOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    email: string,
    plainToken: string,
    metadata?: Partial<ParsedDeviceInfo>,
  ): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    
    if (user === null) {
      throw new UnauthorizedError("Invalid email or OTP", "AUTH_INVALID_CREDENTIALS");
    }

    if (user.status === "SUSPENDED") {
      throw new UnauthorizedError("Account suspended. Contact support.", "AUTH_ACCOUNT_SUSPENDED");
    }

    if (user.isLocked()) {
      throw new AuthDomainError(
        "AUTH_ACCOUNT_NOT_FOUND",
        `Account temporarily locked. Try again after ${user.lockedUntil?.toISOString()}.`,
      );
    }

    const tokenHash = this.tokenService.hashToken(plainToken);

    const record = await this.userRepository.findVerificationToken({
      tokenHash,
      type: "LOGIN_OTP",
    });

    if (record === null || record.userId !== user.id) {
      await this.userRepository.incrementLoginAttempts(user.id);
      throw new AuthDomainError("AUTH_TOKEN_INVALID", "Invalid login OTP");
    }

    if (record.expiresAt < new Date()) {
      throw new AuthDomainError("AUTH_TOKEN_EXPIRED", "Login OTP has expired");
    }

    // Mark token as used
    await this.userRepository.markVerificationTokenUsed(record.id);

    // Reset login attempts on success
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id, metadata?.ipAddress ?? "");

    // Create session with full device telemetry
    const sessionId = await this.sessionService.createSession(user.id, metadata);

    // If MFA is enabled, issue a temporary MFA token instead of full session tokens
    if (user.mfaEnabled) {
      const mfaToken = await this.jwtService.generateMfaToken(user.id);
      log.info({ userId: user.id }, "MFA required for login");
      return { mfaRequired: true, mfaToken };
    }

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info(
      { userId: user.id, sessionId, browser: metadata?.browser, os: metadata?.os },
      "Login successful via OTP",
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId ?? null,
        emailVerifiedAt: user.emailVerifiedAt,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }
}
