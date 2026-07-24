import pino from 'pino';

import { config, isDevelopment } from './config.js';

/**
 * Application logger — Pino with structured JSON output.
 *
 * Design decisions:
 * - JSON in production: machine-parseable by log aggregators (Datadog, CloudWatch, Loki)
 * - Pretty-print in development: readable in terminal without tooling
 * - Correlation ID bound to every log via child loggers (see logger.middleware.ts)
 * - Log level enforced from config — no runtime log level changes
 * - Redaction: sensitive fields (Authorization, password, token) never appear in logs
 */
export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
      'req.body.token',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  base: {
    app: config.APP_NAME,
    version: config.APP_VERSION,
    env: config.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname,app,version,env',
      },
    },
  }),
});

export type Logger = typeof logger;

/**
 * Create a child logger with a fixed module context.
 * Use this in every service/repository to identify log source.
 *
 * @example
 * const log = createModuleLogger('AuthService');
 * log.info({ userId }, 'User logged in');
 */
export function createModuleLogger(module: string): pino.Logger {
  return logger.child({ module });
}
