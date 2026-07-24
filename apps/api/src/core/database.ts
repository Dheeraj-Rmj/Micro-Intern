import { prisma, checkDatabaseHealth } from '@microintern/database';

import { checkRedisHealth } from './redis.js';
import { createModuleLogger } from './logger.js';

export { prisma };

const log = createModuleLogger('Database');

/**
 * Initialize database connection and verify connectivity.
 * Called during application startup.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info('Database connected successfully');
  } catch (error) {
    log.error({ err: error }, 'Failed to connect to database');
    throw error;
  }
}

export { checkDatabaseHealth, checkRedisHealth };
