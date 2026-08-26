import { REDIS_KEYS, AUTH } from "@microintern/shared";
import bcrypt from "bcryptjs";

import { config } from "@/core/config.js";
import { prisma as defaultPrisma, type PrismaClient } from "@microintern/database";
import { getRedisClient } from "@/core/redis.js";

import type { IPasswordService } from "../../application/interfaces/IPasswordService.js";
import type { ISessionService } from "../../application/interfaces/ISessionService.js";
import type { DeviceSession } from "@microintern/shared";
import type { ParsedDeviceInfo } from "@/shared/utils/device-parser.js";

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
 * Hybrid Redis + PostgreSQL session service — production implementation.
 *
 * Architecture:
 * - High-speed auth validation via Redis (`auth:refresh:{userId}:{sessionId}`)
 * - Comprehensive device history & telemetry in PostgreSQL `Session` table
 * - Instant revocation across single devices or all other devices
 */
export class RedisSessionService implements ISessionService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private get redis() {
    return getRedisClient();
  }

  async createSession(userId: string, metadata?: Partial<ParsedDeviceInfo>): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    // 1. High-speed Redis active session marker
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    await this.redis.setex(key, AUTH.REFRESH_TOKEN_EXPIRY_SECONDS, "active");

    // 2. Persist device telemetry in database
    try {
      await this.prisma.session.create({
        data: {
          id: sessionId,
          userId,
          deviceType: metadata?.deviceType ?? "desktop",
          browser: metadata?.browser ?? "Unknown Browser",
          os: metadata?.os ?? "Unknown OS",
          ipAddress: metadata?.ipAddress ?? "127.0.0.1",
          city: metadata?.city ?? null,
          country: metadata?.country ?? null,
          region: metadata?.region ?? null,
          userAgent: metadata?.userAgent ?? null,
          expiresAt,
          lastUsedAt: new Date(),
        },
      });
    } catch {
      // Non-critical if DB session insert fails (Redis guarantees active state)
    }

    return sessionId;
  }

  async isSessionValid(userId: string, sessionId: string): Promise<boolean> {
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    const exists = await this.redis.exists(key);
    if (exists === 1) return true;

    // Fallback: check if DB record is active and not revoked
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
      });
      if (
        session &&
        session.userId === userId &&
        session.revokedAt === null &&
        session.expiresAt > new Date()
      ) {
        const remainingTtl = Math.max(
          1,
          Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
        );
        await this.redis.setex(key, remainingTtl, "active");
        return true;
      }
    } catch {
      // Return false if check fails
    }

    return false;
  }

  async listUserSessions(userId: string, currentSessionId?: string): Promise<DeviceSession[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastUsedAt: "desc" },
      take: 20, // Return last 20 logins
    });

    const now = new Date();

    return sessions.map((s: (typeof sessions)[number]) => {
      const isCurrent = s.id === currentSessionId;
      const isActive = s.revokedAt === null && s.expiresAt > now;

      let location = "Unknown Location";
      if (s.city && s.country) {
        location = `${s.city}, ${s.country}`;
      } else if (s.country) {
        location = s.country;
      } else if (
        s.ipAddress === "127.0.0.1" ||
        s.ipAddress === "localhost" ||
        (s.ipAddress && s.ipAddress.startsWith("192.168.")) ||
        (s.ipAddress && s.ipAddress.startsWith("10."))
      ) {
        location = "Local Network (Dev)";
      }

      return {
        id: s.id,
        userId: s.userId,
        deviceType: (s.deviceType as DeviceSession["deviceType"]) || "desktop",
        browser: s.browser || "Unknown Browser",
        os: s.os || "Unknown OS",
        ipAddress: s.ipAddress || "127.0.0.1",
        location,
        city: s.city,
        country: s.country,
        region: s.region,
        userAgent: s.userAgent,
        isCurrent,
        isActive,
        lastActiveAt: s.lastUsedAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
      };
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    // 1. Invalidate in Redis
    const key = REDIS_KEYS.refreshToken(userId, sessionId);
    await this.redis.del(key);

    // 2. Mark revoked in database
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    // 1. Find all other active sessions in DB
    const otherSessions = await this.prisma.session.findMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      select: { id: true },
    });

    // 2. Invalidate all their Redis keys
    if (otherSessions.length > 0) {
      const keys = otherSessions.map((s: { id: string }) => REDIS_KEYS.refreshToken(userId, s.id));
      await this.redis.del(...keys);
    }

    // 3. Mark revoked in database
    const updateResult = await this.prisma.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return updateResult.count;
  }

  async revokeAllSessions(userId: string): Promise<void> {
    // 1. Scan and delete all Redis keys for user
    const pattern = `auth:refresh:${userId}:*`;
    let cursor = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = parseInt(nextCursor, 10);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== 0);

    // 2. Mark all as revoked in database
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async touchSession(userId: string, sessionId: string): Promise<void> {
    try {
      await this.prisma.session.updateMany({
        where: { id: sessionId, userId },
        data: { lastUsedAt: new Date() },
      });
    } catch {
      // Non-critical
    }
  }
}
