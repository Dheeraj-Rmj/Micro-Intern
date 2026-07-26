import { EntityStatus, Role } from '@microintern/shared';

import { createModuleLogger } from '@/core/logger.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { AdminUserNotFoundError, UserAlreadySuspendedError, CannotSuspendAdminError } from '../../domain/index.js';

import type { IAdminRepository, UserSummary } from '../ports/IAdminRepository.js';
import type { ISessionService } from '@/modules/auth/application/interfaces/ISessionService.js';

const log = createModuleLogger('SuspendUserUseCase');

export class SuspendUserUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly sessionService: ISessionService
  ) {}

  async execute(adminUserId: string, targetUserId: string): Promise<UserSummary> {
    log.info({ adminUserId, targetUserId }, 'Attempting to suspend platform user account');

    const user = await this.adminRepository.findUserById(targetUserId);
    if (user === null) {
      throw new AdminUserNotFoundError(targetUserId);
    }

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      throw new CannotSuspendAdminError(targetUserId);
    }

    if (user.status === EntityStatus.SUSPENDED) {
      throw new UserAlreadySuspendedError(targetUserId);
    }

    const suspendedUser = await this.adminRepository.updateUserStatus(targetUserId, EntityStatus.SUSPENDED);

    // Immediately revoke all active sessions in Redis so the bad actor is disconnected
    log.info({ targetUserId }, 'Revoking all active Redis sessions for suspended user');
    await this.sessionService.revokeAllSessions(targetUserId);

    void eventBus.emit(DOMAIN_EVENTS.USER_SUSPENDED, {
      userId: suspendedUser.id,
      email: suspendedUser.email,
      suspendedBy: adminUserId,
    });

    return suspendedUser;
  }
}
