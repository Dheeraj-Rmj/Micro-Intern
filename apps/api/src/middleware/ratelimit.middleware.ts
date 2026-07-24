
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import { config } from '@/core/config.js';
import { getRedisClient } from '@/core/redis.js';
import { RateLimitError } from '@/shared/errors/index.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { Request, Response } from 'express';


type RateLimitContext = 'global' | 'auth' | 'ai' | 'upload';

const rateLimitConfigs: Record<RateLimitContext, { windowMs: number; max: number; message: string }> = {
  global: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests. Please slow down.',
  },
  auth: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_AUTH_MAX_REQUESTS,
    message: 'Too many authentication attempts. Please wait before trying again.',
  },
  ai: {
    windowMs: 60_000,
    max: 20,
    message: 'AI request limit exceeded. Please try again in a minute.',
  },
  upload: {
    windowMs: 60_000,
    max: 10,
    message: 'Upload limit exceeded. Please wait before uploading again.',
  },
};

/**
 * Create a rate limiter middleware for a given context.
 *
 * Design: Redis-backed rate limiting for distributed deployments.
 * Each context (global, auth, ai, upload) has separate limits.
 * Rate limit headers are always sent so clients can self-throttle.
 *
 * Key format: rl:{context}:{ip} — unique per IP per context.
 */
export function createRateLimitMiddleware(context: RateLimitContext) {
  const contextConfig = rateLimitConfigs[context];

  return rateLimit({
    windowMs: contextConfig.windowMs,
    max: contextConfig.max,
    standardHeaders: 'draft-7', // `RateLimit-*` headers per RFC 6585
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      // Use authenticated user ID if available, otherwise IP
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
      return `rl:${context}:${userId ?? ip}`;
    },
    store: new RedisStore({
      sendCommand: async (...args: string[]) => {
 
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return (await getRedisClient().call(args[0] ?? '', ...args.slice(1))) as any;
      },
    }),
    handler: (req: Request, res: Response) => {
      const error = new RateLimitError(contextConfig.message);
      ResponseFormatter.error(res, {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    },
    skip: (req: Request): boolean => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/health/ready';
    },
  });
}

/**
 * Stricter rate limiter for auth endpoints.
 * Applied per-route, not globally.
 */
export const authRateLimiter = createRateLimitMiddleware('auth');

/**
 * Rate limiter for AI endpoints.
 */
export const aiRateLimiter = createRateLimitMiddleware('ai');

/**
 * Rate limiter for upload endpoints.
 */
export const uploadRateLimiter = createRateLimitMiddleware('upload');
