import { EntityStatus, Role } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import {
  AdminUserNotFoundError,
  CannotSuspendAdminError,
} from "../../domain/index.js";

import type { IAdminRepository, UserSummary } from "../ports/IAdminRepository.js";

const log = createModuleLogger("UnsuspendUserUseCase");

export class UnsuspendUserUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
  ) {}

  async execute(adminUserId: string, targetUserId: string): Promise<UserSummary> {
    log.info({ adminUserId, targetUserId }, "Attempting to unsuspend platform user account");

    const user = await this.adminRepository.findUserById(targetUserId);
    if (user === null) {
      throw new AdminUserNotFoundError(targetUserId);
    }

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      throw new CannotSuspendAdminError(targetUserId);
    }

    // We don't strictly need to throw if they aren't suspended, but we can just update them to ACTIVE
    // if they are not already ACTIVE.
    const unsuspendedUser = await this.adminRepository.updateUserStatus(
      targetUserId,
      EntityStatus.ACTIVE,
    );

    // No sessions to revoke when unsuspending. Just emit an event if we had one (e.g. USER_UNSUSPENDED)
    // Assuming DOMAIN_EVENTS.USER_UNSUSPENDED might not exist, we'll just log.
    log.info({ targetUserId }, "Successfully unsuspended user account");

    return unsuspendedUser;
  }
}
