
import { config } from '@/core/config.js';
import { checkDatabaseHealth, checkRedisHealth } from '@/core/database.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { Request, Response } from 'express';

/**
 * Health check controller.
 *
 * Endpoints:
 * - GET /health           → Liveness probe (is the process alive?)
 * - GET /health/ready     → Readiness probe (can it serve traffic?)
 * - GET /health/detailed  → Full dependency check (auth-protected, for monitoring)
 *
 * K8s/Docker probe configuration:
 *   livenessProbe: /health
 *   readinessProbe: /health/ready
 *
 * Liveness: Returns 200 if the Express process is running.
 *           Does NOT check dependencies — a DB failure should not kill the pod.
 *
 * Readiness: Returns 200 only if all critical dependencies are healthy.
 *            If not ready, load balancer removes this pod from rotation.
 */
export const healthController = {
  /**
   * GET /health — Liveness probe.
   */
  liveness: (_req: Request, res: Response): void => {
    ResponseFormatter.success(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: config.APP_VERSION,
    });
  },

  /**
   * GET /health/ready — Readiness probe.
   */
  readiness: async (_req: Request, res: Response): Promise<void> => {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const isReady = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';

    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      success: isReady,
      data: {
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbHealth,
          redis: redisHealth,
        },
      },
    });
  },

  /**
   * GET /health/detailed — Comprehensive health report.
   * Requires ADMIN or SUPER_ADMIN — not exposed publicly.
   */
  detailed: async (req: Request, res: Response): Promise<void> => {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const allHealthy = [dbHealth, redisHealth].every((h) => h.status === 'healthy');

    ResponseFormatter.success(res, {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: config.APP_VERSION,
      environment: config.NODE_ENV,
      process: {
        pid: process.pid,
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
      },
      dependencies: {
        database: dbHealth,
        redis: redisHealth,
      },
    });
  },

  /**
   * GET /health/metrics — Prometheus observability metrics probe.
   */
  metrics: (_req: Request, res: Response): void => {
    const mem = process.memoryUsage();
    const metricsPlain = [
      `# HELP process_uptime_seconds The uptime of the Node.js process`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${process.uptime()}`,
      `# HELP process_heap_bytes_used Node.js heap memory used in bytes`,
      `# TYPE process_heap_bytes_used gauge`,
      `process_heap_bytes_used ${mem.heapUsed}`,
      `# HELP process_heap_bytes_total Node.js total heap memory in bytes`,
      `# TYPE process_heap_bytes_total gauge`,
      `process_heap_bytes_total ${mem.heapTotal}`,
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.status(200).send(metricsPlain);
  },
};

