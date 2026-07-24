import type { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';

import { corsOrigins } from '@/core/config.js';

/**
 * Security middleware stack.
 *
 * Applied in this order — sequence matters:
 * 1. Helmet — sets 15+ security HTTP headers
 * 2. CORS — restricts cross-origin requests to allowed origins
 * 3. HPP — prevents HTTP Parameter Pollution attacks
 *
 * OWASP Top 10 mitigations:
 * - A01 Broken Access Control → RBAC middleware (auth.middleware.ts)
 * - A02 Cryptographic Failures → bcrypt + JWT (auth infrastructure)
 * - A03 Injection → Zod validation (validate.middleware.ts)
 * - A05 Security Misconfiguration → Helmet headers
 * - A07 Auth Failures → rate limiting + lockout (ratelimit.middleware.ts)
 */
export function applySecurityMiddleware(app: Application): void {
  // ── Helmet — HTTP Security Headers ─────────────────────────────────────
  app.use(
    helmet({
      // Content Security Policy — restrict script/style sources
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // Cross-Origin headers
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      // Prevent MIME type sniffing
      noSniff: true,
      // Prevent clickjacking
      frameguard: { action: 'deny' },
      // Enforce HTTPS
      hsts: {
        maxAge: 31_536_000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Hide Express fingerprint
      hidePoweredBy: true,
      // Disable XSS filter (modern browsers ignore it, it can cause issues)
      xssFilter: false,
      // Referrer Policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server requests (no origin header)
        if (origin === undefined) {
          callback(null, true);
          return;
        }
        if (corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin "${origin}" not allowed`));
        }
      },
      credentials: true, // Allow cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'X-Correlation-ID',
      ],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86_400, // Preflight cache 24h
    }),
  );

  // ── HPP — HTTP Parameter Pollution Prevention ────────────────────────────
  // Whitelist parameters that legitimately accept arrays
  app.use(
    hpp({
      whitelist: ['sort', 'filter', 'fields', 'expand'],
    }),
  );
}
