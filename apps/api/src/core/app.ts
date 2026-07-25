import compression from 'compression';
import express, { type Application } from 'express';
import { pinoHttp } from 'pino-http';

import { healthRouter } from '@/api/health/health.routes.js';
import { createV1Router } from '@/api/v1/index.js';
import { errorMiddleware } from '@/middleware/error.middleware.js';
import { createRateLimitMiddleware } from '@/middleware/ratelimit.middleware.js';
import { applySecurityMiddleware } from '@/middleware/security.middleware.js';

import { logger } from './logger.js';

/**
 * Express application factory.
 *
 * Design: App factory function (not singleton module) allows us to create
 * fresh app instances for testing without side effects from module-level state.
 *
 * Middleware order is intentional and must not be changed:
 * 1. Security headers (helmet, CORS, HPP) — first, before any processing
 * 2. Body parsing — before routes read req.body
 * 3. Compression — before response is sent
 * 4. Request logging — before routes for accurate timing
 * 5. Rate limiting — before expensive route handlers
 * 6. Routes — business logic
 * 7. Error handler — must be LAST, catches all errors from routes
 */
export function createApp(): Application {
  const app = express();

  // ── Trust proxy (required for rate limiting behind Nginx/load balancer) ─
  app.set('trust proxy', 1);

  // ── Security middleware (helmet, CORS, HPP) ─────────────────────────────
  applySecurityMiddleware(app);

  // ── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Compression ──────────────────────────────────────────────────────────
  app.use(compression());

  // ── Request logging (Pino HTTP) ──────────────────────────────────────────
  app.use(
    pinoHttp({
      logger,
      // Auto-generate requestId, propagate to all child logs
      genReqId: (req) => {
        return (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();
      },
      customLogLevel: (req, res, error) => {
        if (error !== undefined || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) =>
        `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, error) =>
        `${req.method} ${req.url} ${res.statusCode} - ${error.message}`,
      // Don't log health check endpoints (too noisy)
      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/health/ready',
      },
    }),
  );

  // ── Global rate limiting ─────────────────────────────────────────────────
  app.use(createRateLimitMiddleware('global'));

  // ── Routes ───────────────────────────────────────────────────────────────
  app.use('/health', healthRouter);
  app.use('/api/v1', createV1Router());

  // ── 404 handler ──────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Cannot ${req.method} ${req.path}`,
        requestId: (req as express.Request & { id?: string }).id ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ── Global error handler — MUST be last ──────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
