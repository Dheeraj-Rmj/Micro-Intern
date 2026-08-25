import { createModuleLogger } from "@/core/logger.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";

import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { IJwtService } from "../interfaces/IJwtService.js";
import type { ISessionService } from "../interfaces/ISessionService.js";
import type { ParsedDeviceInfo } from "@/shared/utils/device-parser.js";

const log = createModuleLogger("OAuthLoginUseCase");

export interface OAuthProfile {
  provider: string; // 'LINKEDIN', 'MICROSOFT', etc.
  providerAccountId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
}

export class OAuthLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
  ) {}

  async execute(
    profile: OAuthProfile,
    metadata?: Partial<ParsedDeviceInfo>,
    action: string = "login",
  ) {
    try {
      // 1. Check if OAuth account already exists
      let user = await this.userRepository.findByOAuthAccount(
        profile.provider,
        profile.providerAccountId,
      );

      if (!user) {
        // 2. If not, check if a user with this email already exists
        user = await this.userRepository.findByEmail(profile.email);

        if (user) {
          // If the intent is "signup", but the account already exists, reject the attempt.
          if (action === "signup") {
            throw new Error("AccountAlreadyExists");
          }

          // Link new OAuth account to existing user (only if logging in)
          await this.userRepository.linkOAuthAccount(user.id, {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            accessToken: profile.accessToken,
            refreshToken: profile.refreshToken,
          });
        } else {
          // 3. User does not exist at all.
          // If the intent is to just "login", we reject the attempt.
          if (action === "login") {
            throw new Error("AccountNotFound");
          }

          // Otherwise (action === "signup"), we create a brand new user
          user = await this.userRepository.createOAuthCandidate({
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            accessToken: profile.accessToken,
            refreshToken: profile.refreshToken,
          });
        }
      }

      // 4. Optionally update avatar if we have a new one and user doesn't
      if (
        profile.avatarUrl !== undefined &&
        profile.avatarUrl !== null &&
        profile.avatarUrl !== "" &&
        (user.avatarUrl === undefined || user.avatarUrl === null || user.avatarUrl === "")
      ) {
        await this.userRepository.updateAvatar(user.id, profile.avatarUrl);
      }

      // 5. Create Session with device telemetry & Tokens
      const sessionId = await this.sessionService.createSession(user.id, metadata);
      const { accessToken, refreshToken } = await this.jwtService.generateTokenPair(
        user,
        sessionId,
      );

      await this.userRepository.updateLastLogin(user.id, metadata?.ipAddress ?? "OAuth");
      await this.userRepository.resetLoginAttempts(user.id);

      log.info(
        {
          userId: user.id,
          provider: profile.provider,
          browser: metadata?.browser,
          os: metadata?.os,
        },
        `OAuth login successful`,
      );

      return {
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error: any) {
      log.error({ error }, "OAuth Login failed");
      
      if (
        error.message === "AccountNotFound" || error.code === "AccountNotFound" ||
        error.message === "AccountAlreadyExists" || error.code === "AccountAlreadyExists"
      ) {
        throw error;
      }
      
      throw new AuthDomainError("UNAUTHORIZED", "Failed to process OAuth login");
    }
  }
}
