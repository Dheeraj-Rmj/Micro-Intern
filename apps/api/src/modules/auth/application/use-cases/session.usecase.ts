import { createModuleLogger } from '@/core/logger.js';
import type { ISessionService } from '../interfaces/ISessionService.js';
import type { DeviceSession, RevokeSessionResult } from '@microintern/shared';

const log = createModuleLogger('SessionUseCases');

/**
 * List all device sessions and login history for authenticated user.
 */
export class ListSessionsUseCase {
  constructor(private readonly sessionService: ISessionService) {}

  async execute(userId: string, currentSessionId?: string): Promise<DeviceSession[]> {
    log.info({ userId, currentSessionId }, 'Fetching active device sessions');
    return await this.sessionService.listUserSessions(userId, currentSessionId);
  }
}

/**
 * Revoke a specific device session (log out specific device).
 */
export class RevokeSessionUseCase {
  constructor(private readonly sessionService: ISessionService) {}

  async execute(userId: string, sessionId: string): Promise<RevokeSessionResult> {
    log.info({ userId, sessionId }, 'Revoking specific device session');
    await this.sessionService.revokeSession(userId, sessionId);
    return {
      success: true,
      message: 'Session revoked successfully. The device has been logged out.',
      revokedSessionId: sessionId,
    };
  }
}

/**
 * Revoke all other device sessions (log out from all other devices).
 */
export class RevokeOtherSessionsUseCase {
  constructor(private readonly sessionService: ISessionService) {}

  async execute(userId: string, currentSessionId: string): Promise<RevokeSessionResult> {
    log.info({ userId, currentSessionId }, 'Revoking all other device sessions');
    const revokedCount = await this.sessionService.revokeOtherSessions(userId, currentSessionId);
    return {
      success: true,
      message: `Successfully logged out of ${revokedCount} other device(s).`,
      revokedCount,
    };
  }
}
