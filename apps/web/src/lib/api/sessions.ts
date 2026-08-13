import { apiClient } from './client';
import type { DeviceSession, RevokeSessionResult } from '@microintern/shared';

export const sessionApi = {
  /**
   * Fetch all active device logins and login history for the current user.
   */
  getDeviceSessions: async (): Promise<DeviceSession[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { sessions: DeviceSession[] } }>(
        '/auth/sessions',
        { skipAuthRefresh: true } as any
      );
      return response.data?.data?.sessions ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Revoke a specific device session / log out remote device.
   */
  revokeSession: async (sessionId: string): Promise<RevokeSessionResult> => {
    const response = await apiClient.delete<{ success: boolean; data: RevokeSessionResult }>(
      `/auth/sessions/${sessionId}`,
      { skipAuthRefresh: true } as any
    );
    return response.data?.data ?? { success: true, message: 'Device logged out' };
  },

  /**
   * Log out of all devices except the current active session.
   */
  revokeOtherSessions: async (): Promise<RevokeSessionResult> => {
    const response = await apiClient.post<{ success: boolean; data: RevokeSessionResult }>(
      '/auth/sessions/revoke-others',
      {},
      { skipAuthRefresh: true } as any
    );
    return response.data?.data ?? { success: true, message: 'All other devices logged out' };
  },
};
