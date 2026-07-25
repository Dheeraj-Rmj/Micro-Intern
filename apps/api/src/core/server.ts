import http from 'node:http';

import { createApp } from './app.js';
import { config } from './config.js';
import { createContainer } from './container.js';
import { connectDatabase, disconnectDatabase } from './database.js';
import { logger } from './logger.js';
import { connectRedis, disconnectRedis } from './redis.js';

/**
 * HTTP server bootstrap and graceful shutdown.
 *
 * Startup sequence:
 * 1. Validate config (happens on import of config.ts)
 * 2. Connect database
 * 3. Connect Redis
 * 4. Initialize DI container
 * 5. Create Express app
 * 6. Start HTTP server
 *
 * Shutdown sequence (SIGTERM / SIGINT):
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete (30s timeout)
 * 3. Disconnect Redis
 * 4. Disconnect database
 * 5. Exit process
 *
 * This ensures zero-downtime deployments when used with a load balancer.
 */

async function bootstrap(): Promise<void> {
  logger.info({ env: config.NODE_ENV, version: config.APP_VERSION }, '🚀 Starting MicroIntern API');

  // ── Infrastructure connections ────────────────────────────────────────────
  await connectDatabase();
  await connectRedis();

  // ── Initialize DI container ───────────────────────────────────────────────
  createContainer();
  logger.info('DI container initialized');

  // ── Create Express application ────────────────────────────────────────────
  const app = createApp();
  const server = http.createServer(app);

  // ── Start server ──────────────────────────────────────────────────────────
  server.listen(config.API_PORT, config.API_HOST, () => {
    logger.info(
      {
        host: config.API_HOST,
        port: config.API_PORT,
        url: config.API_BASE_URL,
      },
      `✅ API server listening`,
    );
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const SHUTDOWN_TIMEOUT_MS = 30_000;

  async function gracefulShutdown(signal: string): Promise<void> {
    logger.info({ signal }, '⏹️ Graceful shutdown initiated');

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Force exit after timeout
    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timeout — forcing exit');
// eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref(); // Don't keep process alive for this timer

    try {
      await disconnectRedis();
      await disconnectDatabase();
      logger.info('✅ Clean shutdown complete');
// eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Error during shutdown');
// eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  // ── Unhandled rejection / exception handlers ──────────────────────────────
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, '🚨 Unhandled Promise Rejection — shutting down');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
    void gracefulShutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, '🚨 Uncaught Exception — shutting down');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
    void gracefulShutdown('uncaughtException');
  });
}

// ── Entry point ────────────────────────────────────────────────────────────
bootstrap().catch((error: unknown) => {
  console.error('Fatal error during startup:', error);
// eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
