import { REDIS_KEYS } from '@microintern/shared';
import jwt from 'jsonwebtoken';

import { config } from '@/core/config.js';
import { getRedisClient } from '@/core/redis.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

import type { JwtAccessPayload, AuthenticatedUser } from '@microintern/shared';
import type { Request, Response, NextFunction } from 'express';

/**
 * Extend Express Request to include authenticated user.
 * This augmentation is available throughout the application.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

/**
 * Authentication middleware — verifies JWT access token.
 *
 * Design:
 * - Access token is expected in Authorization header: "Bearer <token>"
 * - Verifies signature, expiry, issuer, and audience
 * - Checks Redis to ensure session has not been revoked
 * - Attaches typed user context to req.user
 *
 * Session revocation: When a user logs out or changes password,
 * all their sessions are removed from Redis. Even if an access token
 * is technically valid (not expired), it will fail the Redis check.
 * This is the key advantage of Redis-backed sessions over pure JWT.
 *
 * Note: Access tokens are short-lived (15min) — the Redis check
 * is only a secondary safety net for immediate invalidation scenarios.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {


    const token = extractBearerToken(req);

    if (token === null) {
      throw new UnauthorizedError('Authentication token required', 'AUTH_TOKEN_INVALID');
    }

    let payload: JwtAccessPayload;
    try {
      payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
        issuer: config.JWT_ISSUER,
        audience: config.JWT_AUDIENCE,
        algorithms: ['HS256'],
      }) as JwtAccessPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired', 'AUTH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Invalid access token', 'AUTH_TOKEN_INVALID');
    }

    // Verify session is still active in Redis
    const redis = getRedisClient();
    const sessionKey = REDIS_KEYS.refreshToken(payload.sub, payload.sessionId);
    const sessionExists = await redis.exists(sessionKey);

    if (sessionExists === 0) {
      throw new UnauthorizedError('Session expired or revoked', 'AUTH_TOKEN_REVOKED');
    }

    // Attach authenticated user to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional auth middleware — attaches user if token present, but doesn't
 * require authentication. Useful for public endpoints that personalize
 * content for logged-in users.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {


  const token = extractBearerToken(req);
  if (token === null) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as JwtAccessPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      sessionId: payload.sessionId,
    };
  } catch {
    // Token invalid — proceed as unauthenticated (no error thrown)
  }

  next();
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
