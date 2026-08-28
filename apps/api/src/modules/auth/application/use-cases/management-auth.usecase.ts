import { Role } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { ForbiddenError } from "@/shared/errors/index.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";

import type { LoginDto } from "../dtos/auth.dto.js";
import type { IJwtService } from "../interfaces/IJwtService.js";
import type { IPasswordService, ISessionService } from "../interfaces/IPasswordService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

const log = createModuleLogger("ManagementLoginUseCase");

const ALLOWED_MANAGEMENT_ROLES = [Role.COMPANY_OWNER, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN];

/**
 * Management Portal Login Use Case.
 *
 * Dedicated login handler for enterprise and platform management users.
 * Enforces strict role boundaries — Candidate accounts cannot log in here.
 */
export class ManagementLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
  ) {}

  async execute(dto: LoginDto, ipAddress: string) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (user === null || user.passwordHash === null || user.passwordHash === undefined) {
      log.warn({ email: dto.email, ipAddress }, "Management login failed — invalid credentials");
      throw new AuthDomainError("UNAUTHORIZED", "Invalid email or password");
    }

    // Role verification: strictly prohibit Candidate logins on Management Portal
    if (!ALLOWED_MANAGEMENT_ROLES.includes(user.role as Role)) {
      log.warn(
        { userId: user.id, role: user.role, ipAddress },
        "Candidate attempted login on Management Portal",
      );
      throw new ForbiddenError(
        "Candidate login is not permitted on the Management Portal",
        "AUTH_ROLE_MISMATCH",
      );
    }

    // Check account lockout
    if (user.isLocked()) {
      log.warn({ userId: user.id, ipAddress }, "Management login attempt on locked account");
      throw new AuthDomainError(
        "AUTH_ACCOUNT_LOCKED",
        "Account is temporarily locked due to too many failed login attempts",
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      await this.userRepository.incrementLoginAttempts(user.id);
      log.warn({ userId: user.id, ipAddress }, "Management login failed — wrong password");
      throw new AuthDomainError("UNAUTHORIZED", "Invalid email or password");
    }

    // Success — clear login attempts and update last login
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id, ipAddress);

    // If MFA is enabled, issue a temporary MFA token instead of full session tokens
    if (user.mfaEnabled) {
      const mfaToken = await this.jwtService.generateMfaToken(user.id);
      log.info({ userId: user.id }, "MFA required for management login");
      return { mfaRequired: true, mfaToken };
    }

    // Create session and tokens
    const sessionId = await this.sessionService.createSession(user.id);
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info(
      { userId: user.id, role: user.role, ipAddress },
      "Management user logged in successfully",
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        companyId: user.companyId,
        forcePasswordChange: user.forcePasswordChange,
        isOnboarded: user.isOnboarded,
      },
      tokens,
    };
  }
}
