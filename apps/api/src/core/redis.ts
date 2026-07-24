import { Redis } from 'ioredis';

import { config } from './config.js';
import { createModuleLogger } from './logger.js';

const log = createModuleLogger('Redis');

/**
 * Redis client singleton with connection lifecycle management.
 *
 * Design decisions:
 * - Single shared connection for all Redis operations (BullMQ creates its own connections)
 * - Automatic reconnection with exponential backoff — don't crash on transient failures
 * - lazyConnect: true — connection only established when first command is issued
 * - enableReadyCheck: true — waits for Redis to be fully ready before accepting commands
 * - maxRetriesPerRequest: null for BullMQ clients (required by BullMQ)
 */

let redisClient: Redis | null = null;

export function createRedisClient(options?: { maxRetriesPerRequest?: null }): Redis {
  const client = new Redis(config.REDIS_URL, {
    password: config.REDIS_PASSWORD ?? undefined,
    db: config.REDIS_DB,
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: options?.maxRetriesPerRequest ?? 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 500, 5000); // Max 5s backoff
      log.warn({ attempt: times, delayMs: delay }, 'Redis reconnecting...');
      return delay;
    },
    reconnectOnError: (error: Error) => {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
      return targetErrors.some((e) => error.message.includes(e));
    },
  });

  client.on('connect', () => log.info('Redis connected'));
  client.on('ready', () => log.info('Redis ready'));
  client.on('error', (error: Error) => log.error({ err: error }, 'Redis error'));
  client.on('close', () => log.warn('Redis connection closed'));
  client.on('reconnecting', () => log.info('Redis reconnecting'));

  return client;
}

/**
 * Singleton Redis client for general application use.
 */
export function getRedisClient(): Redis {
  if (redisClient === null) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Connect the Redis client.
 * Called during application startup.
 */
export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
  log.info('Redis client connected successfully');
}

/**
 * Graceful Redis disconnect.
 * Called during application shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient !== null) {
    await redisClient.quit();
    redisClient = null;
    log.info('Redis disconnected');
  }
}

/**
 * Redis health check.
 */
export async function checkRedisHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const client = getRedisClient();
    await client.ping();
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
