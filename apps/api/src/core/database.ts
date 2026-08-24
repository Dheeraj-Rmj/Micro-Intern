import { prisma, checkDatabaseHealth, disconnectDatabase } from "@microintern/database";

import { createModuleLogger } from "./logger.js";
import { checkRedisHealth } from "./redis.js";

export { prisma, disconnectDatabase };

const log = createModuleLogger("Database");

/**
 * Initialize database connection and verify connectivity.
 * Called during application startup.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info("Database connected successfully");
  } catch (error) {
    log.error({ err: error }, "Failed to connect to database");
    throw error;
  }
}

export { checkDatabaseHealth, checkRedisHealth };
