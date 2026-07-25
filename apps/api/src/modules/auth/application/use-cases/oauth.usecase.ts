import { createModuleLogger } from '@/core/logger.js';
import { AuthDomainError } from '@/shared/errors/DomainError.js';

import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IJwtService } from '../interfaces/IJwtService.js';
import type { ISessionService } from '../interfaces/ISessionService.js';

const log = createModuleLogger('OAuthLoginUseCase');

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
    private readonly sessionService: ISessionService
  ) {}

  async execute(profile: OAuthProfile) {
    try {
      // 1. Check if OAuth account already exists
      let user = await this.userRepository.findByOAuthAccount(profile.provider, profile.providerAccountId);

      if (!user) {
        // 2. If not, check if a user with this email already exists
        user = await this.userRepository.findByEmail(profile.email);

        if (user) {
          // Link new OAuth account to existing user
          await this.userRepository.linkOAuthAccount(user.id, {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            accessToken: profile.accessToken,
            refreshToken: profile.refreshToken,
          });
        } else {
          // 3. Create a brand new user
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
      if (profile.avatarUrl && !user.avatarUrl) {
        await this.userRepository.updateAvatar(user.id, profile.avatarUrl);
        // user.updateAvatar(profile.avatarUrl);
      }

      // 5. Create Session & Tokens
      const sessionId = await this.sessionService.createSession(user.id);
      const { accessToken, refreshToken } = await this.jwtService.generateTokenPair(user, sessionId);

      // We only store the hash of the refresh token
      // Currently session logic saves "active" so we need to store the hash somewhere if tracking.
      // We will skip storing the hash for OAuth unless needed (Redis is just using sessionId as key).

      await this.userRepository.updateLastLogin(user.id, 'OAuth');
      await this.userRepository.resetLoginAttempts(user.id);

      log.info({ userId: user.id, provider: profile.provider }, `OAuth login successful`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }
      };
    } catch (error) {
      log.error({ error }, 'OAuth Login failed');
      throw new AuthDomainError('UNAUTHORIZED', 'Failed to process OAuth login');
    }
  }
}
