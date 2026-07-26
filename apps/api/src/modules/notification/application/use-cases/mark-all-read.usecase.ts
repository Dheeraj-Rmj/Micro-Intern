import { createModuleLogger } from '@/core/logger.js';

import type { INotificationRepository } from '../ports/INotificationRepository.js';

const log = createModuleLogger('MarkAllNotificationsReadUseCase');

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  async execute(userId: string): Promise<{ count: number }> {
    log.info({ userId }, 'Attempting to clear and mark all notifications read for user');
    const count = await this.repository.markAllReadByUser(userId);
    log.info({ userId, count }, 'All notifications marked as read');
    return { count };
  }
}
