import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUserResponse } from '@microintern/shared';

/**
 * Auth Store — Zustand store for client-side authentication state.
 *
 * Design:
 * - Persisted to sessionStorage (cleared when browser closes)
 * - NOT localStorage — prevents stale auth state across sessions
 * - Access token is NOT stored here (lives in memory in api/client.ts)
 * - Only stores non-sensitive user metadata for UI rendering
 *
 * Session recovery:
 * - On page load, useCurrentUser() query re-validates with the API
 * - If valid httpOnly cookie exists, a new access token is issued
 * - If not, user is redirected to login
 */

type AuthState = {
  user: AuthUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUserResponse) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ── Selector hooks ────────────────────────────────────────────────────────────

/**
 * Get the current user — throws if not authenticated.
 * Use only inside auth-protected layouts.
 */
export function useUser(): AuthUserResponse {
  const user = useAuthStore((s) => s.user);
  if (user === null) {
    throw new Error('useUser() called outside authenticated context');
  }
  return user;
}

/**
 * Check if the current user has at least the given role.
 */
export function useHasRole(role: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (user === null) return false;

  const hierarchy = ['CANDIDATE', 'RECRUITER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'];
  const userIndex = hierarchy.indexOf(user.role);
  const requiredIndex = hierarchy.indexOf(role);

  return userIndex >= requiredIndex;
}
