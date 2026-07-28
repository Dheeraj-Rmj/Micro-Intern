'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/features/auth/services/auth.service';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam =
    searchParams.get('accessToken') ?? searchParams.get('token') ?? '';
  const errorParam = searchParams.get('error');

  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? 'Authentication was canceled or failed.' : null
  );

  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    async function processOAuthCallback() {
      if (!tokenParam) {
        if (!errorParam) {
          setErrorMessage('Missing authentication token from OAuth provider.');
        }
        return;
      }

      try {
        useAuthStore.setState({ accessToken: tokenParam, isLoading: true });
        const user = await authService.getCurrentUser();

        if (isMounted) {
          setAuth(user, tokenParam);
          router.replace('/dashboard');
        }
      } catch (error) {
        if (isMounted) {
          clearAuth();
          setErrorMessage(
            'Failed to retrieve candidate profile. Please try signing in again.'
          );
        }
      }
    }

    void processOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [tokenParam, errorParam, router, setAuth, clearAuth]);

  if (errorMessage !== null) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">
          OAuth Sign In Error
        </h3>
        <p className="mt-2 text-sm text-slate-400">{errorMessage}</p>
        <Link
          href="/auth/login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-indigo-500"
        >
          <span>Return to Sign in</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <h3 className="mt-4 text-lg font-semibold text-white">
        Completing secure sign-in...
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Connecting your candidate profile to MicroIntern.
      </p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
