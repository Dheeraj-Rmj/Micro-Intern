import { createModuleLogger } from "@/core/logger.js";

import type {
  INotificationRepository,
  PaginatedNotifications,
} from "../ports/INotificationRepository.js";

const log = createModuleLogger("ListNotificationsUseCase");

export class ListNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  async execute(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ): Promise<PaginatedNotifications> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const unreadOnly = options.unreadOnly || false;

    log.info({ userId, page, limit, unreadOnly }, "Fetching paginated notifications for user");
    return await this.repository.listByUser(userId, page, limit, unreadOnly);
  }
}
