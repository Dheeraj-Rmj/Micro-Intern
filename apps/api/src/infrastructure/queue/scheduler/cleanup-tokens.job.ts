import type { PrismaClient } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("CleanupTokensJob");

export async function cleanupExpiredTokens(
  prisma: PrismaClient,
): Promise<{ deletedCount: number }> {
  log.info("Executing scheduled job: cleanupExpiredTokens");
  const now = new Date();

  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  log.info({ deletedCount: result.count }, "cleanupExpiredTokens completed");
  return { deletedCount: result.count };
}
