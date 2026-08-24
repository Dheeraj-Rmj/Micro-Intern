import { authenticator } from "otplib";
import { createModuleLogger } from "@/core/logger.js";
import { UnauthorizedError, AuthDomainError } from "@/shared/errors/index.js";

import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { IJwtService } from "../interfaces/IJwtService.js";
import type { ISessionService } from "../interfaces/ISessionService.js";
import type { ParsedDeviceInfo } from "@/shared/utils/device-parser.js";
import type { LoginResponse } from "../dtos/auth.dto.js";

const log = createModuleLogger("MfaLoginUseCase");

export class MfaLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
  ) {}

  async execute(
    mfaToken: string,
    code: string,
    metadata?: Partial<ParsedDeviceInfo>,
  ): Promise<LoginResponse> {
    // 1. Verify MFA temporary token
    const { sub: userId } = await this.jwtService.verifyMfaToken(mfaToken);

    // 2. Fetch User
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    if (!user.mfaEnabled || !user.totpSecret) {
      throw new UnauthorizedError("MFA is not fully setup on this account");
    }

    // 3. Verify the 6-digit TOTP code
    const isValid = authenticator.verify({ token: code, secret: user.totpSecret });
    if (!isValid) {
      await this.userRepository.incrementLoginAttempts(user.id);
      throw new UnauthorizedError("Invalid TOTP token", "AUTH_MFA_TOKEN_INVALID");
    }

    // 4. Finalize login
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id, metadata?.ipAddress ?? "");

    const sessionId = await this.sessionService.createSession(user.id, metadata);
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info({ userId: user.id, sessionId }, "MFA Login successful");

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
