import { PrismaClient } from "./generated/client/index.js";

/**
 * PrismaClient singleton with connection pool configuration.
 *
 * Design decisions:
 * - Global singleton prevents connection pool exhaustion in development
 *   (Next.js HMR creates new module instances on every file change)
 * - Logging configured per environment:
 *   - development: query + error + warn
 *   - production: error only (performance-sensitive)
 * - errorFormat: 'minimal' in production — no stack traces in error messages
 */

const createPrismaClient = () => {
  const isDevelopment = process.env["NODE_ENV"] === "development";

  return new PrismaClient({
    log: isDevelopment
      ? [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "warn" },
        ]
      : [{ emit: "event", level: "error" }],
    errorFormat: isDevelopment ? "pretty" : "minimal",
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown — ensures all pending queries complete before closing.
 * Register this in your server shutdown handler.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Health check — verifies database connectivity.
 */
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export type { PrismaClient };
export { Prisma } from "./generated/client/index.js";
