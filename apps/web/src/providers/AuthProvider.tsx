"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { setAccessToken } from "@/lib/api/client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      // Restore the in-memory token for the API client from local storage
      setAccessToken(accessToken);

      try {
        const user = await authService.getCurrentUser();
        if (isMounted) {
          setAuth(user, accessToken);
        }
      } catch (error) {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [accessToken, setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
