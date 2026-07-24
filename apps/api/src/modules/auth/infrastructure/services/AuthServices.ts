import bcrypt from 'bcryptjs';

import type { IPasswordService, ISessionService } from '../../application/interfaces/IPasswordService.js';
import { config } from '@/core/config.js';
import { getRedisClient } from '@/core/redis.js';
import { REDIS_KEYS, AUTH } from '@microintern/shared';

/**
 * bcrypt password service — production implementation.
 */
export class BcryptPasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

/**
 * Redis session service — production implementation.
 *
 * Session storage: refresh tokens are stored in Redis with TTL.
 * Key: auth:refresh:{userId}:{sessionId}
 *
 * On logout: key is deleted → token immediately invalid even if not expired.
 * On logout all: all keys matching auth:refresh:{userId}:* are deleted.
 */
export class RedisSessionService implements ISessionService {
  private get redis() {
    return getRedisClient();
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    // Value stored is a placeholder — the refresh token hash is stored separately
    // when the refresh token is issued (in JwtService.generateTokenPair)
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    await this.redis.setex(key, AUTH.REFRESH_TOKEN_EXPIRY_SECONDS, 'active');
    return sessionId;
  }

  async isSessionValid(userId: string, sessionId: string): Promise<boolean> {
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    await this.redis.del(key);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    // Scan for all session keys for this user
    const pattern = `auth:refresh:${userId}:*`;
    let cursor = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = parseInt(nextCursor, 10);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== 0);
  }
}
