import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CandidateUser } from '@/features/auth/types';

interface AuthState {
  user: CandidateUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: CandidateUser, accessToken: string) => void;
  updateUser: (partialUser: Partial<CandidateUser>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  setAuthenticated: (authenticated: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user: CandidateUser, accessToken: string) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false
        });
      },

      updateUser: (partialUser: Partial<CandidateUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null
        }));
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: any) => {
        set({ user: user as CandidateUser | null });
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
      },

      reset: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }),
    {
      name: 'microintern-candidate-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
