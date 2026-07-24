import type { Request, Response, NextFunction } from 'express';
import type { AuditAction } from '@microintern/shared';
import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('AuditMiddleware');

/**
 * Audit trail middleware factory.
 *
 * Design: Audit log writes are performed asynchronously (fire-and-forget)
 * to avoid adding latency to the main request. If audit logging fails,
 * the error is logged but does not affect the response.
 *
 * For compliance-critical writes, use the synchronous AuditService directly.
 *
 * @example
 * router.post('/trials',
 *   authMiddleware,
 *   audit('CREATE', 'Trial'),
 *   controller.createTrial,
 * );
 */
export function audit(action: AuditAction, entityType: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Extract entity ID from params or response body
    const entityId = req.params['id'] ?? req.params[`${entityType.toLowerCase()}Id`];

    // Fire-and-forget async audit write
    const writeAudit = async () => {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: req.user?.id ?? null,
            actorRole: req.user?.role ?? null,
            action,
            entityType,
            entityId: entityId ?? null,
            ipAddress: req.ip ?? null,
            userAgent: req.headers['user-agent'] ?? null,
            requestId: (req as Request & { id?: string }).id ?? null,
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
            },
          },
        });
      } catch (error) {
        // Audit failure must never break the main flow
        log.error({ err: error, action, entityType }, 'Audit log write failed');
      }
    };

    // Don't await — async fire-and-forget
    void writeAudit();

    next();
  };
}
