import { getContainer } from '@/core/container.js';
import { createModuleLogger } from '@/core/logger.js';
import { DOMAIN_EVENTS, type DomainEvent, eventBus } from '@/shared/events/EventBus.js';

import { Notification } from '../../domain/entities/Notification.entity.js';

import type { INotificationRepository } from '../../application/ports/INotificationRepository.js';

const log = createModuleLogger('NotificationEventListener');

export function initNotificationListeners(): void {
  log.info('Initializing Global Notification Event Subscribers across all modules');
  const container = getContainer();

  // Helper to persist generated alert cleanly
  const notifyUser = async (userId: string, type: string, title: string, body: string, data: Record<string, unknown> = {}): Promise<void> => {
    try {
      const repo = container.get<INotificationRepository>('INotificationRepository');
      const notification = Notification.create({ userId, type, title, body, data });
      await repo.create(notification);
      log.info({ userId, type, title }, 'Global notification generated and stored');
    } catch (error: any) {
      log.error({ err: error, userId, type }, 'Failed to persist global notification');
    }
  };

  // 1. Listen for COMPANY_VERIFIED from Module 06 (Admin)
  eventBus.on(DOMAIN_EVENTS.COMPANY_VERIFIED, async (event: DomainEvent<any>) => {
    const { companyId } = event.payload || {};
    if (!companyId) return;
    try {
      const db = (container as any).infra?.db;
      if (db) {
        const company = await db.company.findUnique({ where: { id: companyId }, include: { members: true } });
        if (company) {
          for (const member of company.members) {
            await notifyUser(
              member.userId,
              'COMPANY_VERIFIED',
              'Company Verified!',
              `Your organization "${company.name}" has been verified by administrators. You can now publish public assessment assessments.`,
              { companyId }
            );
          }
        }
      }
    } catch (err) {
      log.error({ err, companyId }, 'Error executing company verified notification listener');
    }
  });

  // 2. Listen for USER_SUSPENDED from Module 06 (Admin)
  eventBus.on(DOMAIN_EVENTS.USER_SUSPENDED, async (event: DomainEvent<any>) => {
    const { userId } = event.payload || {};
    if (userId) {
      await notifyUser(
        userId,
        'USER_SUSPENDED',
        'Account Suspended',
        'Your administrative privileges and platform access have been temporarily suspended due to a terms of service violation.',
        { userId }
      );
    }
  });

  // 3. Listen for PIPELINE_CANDIDATE_MOVED from Module 05 (Pipeline)
  eventBus.on(DOMAIN_EVENTS.PIPELINE_CANDIDATE_MOVED, async (event: DomainEvent<any>) => {
    const { entryId, toStageId } = event.payload || {};
    if (entryId) {
      log.info({ entryId, toStageId }, 'Processed candidate pipeline stage migration event alert');
    }
  });
}
