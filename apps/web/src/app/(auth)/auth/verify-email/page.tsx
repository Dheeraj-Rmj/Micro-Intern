'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Mail
} from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (verificationToken: string) =>
      authService.verifyEmail(verificationToken),
    onError: (error: unknown) => {
      let message =
        'Verification link is invalid or expired. Please request a new verification email.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const errObj = error as {
          response?: { data?: { message?: string } };
        };
        if (errObj.response?.data?.message) {
          message = errObj.response.data.message;
        }
      }
      setErrorMessage(message);
    }
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">
          Verify your email address
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          We have sent an email with a verification link to your inbox. Please
          click the link to activate your candidate portal access.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <span>Return to Sign in</span>
        </Link>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-sm font-medium text-slate-300">
          Verifying your email address...
        </p>
      </div>
    );
  }

  if (verifyMutation.isError || errorMessage !== null) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">
          Verification Failed
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {errorMessage ?? 'Unable to verify your email address.'}
        </p>
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
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">
        Email Verified Successfully
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Your candidate account is now fully verified. You can sign in and start
        browsing trials.
      </p>
      <Link
        href="/auth/login"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500"
      >
        <span>Sign in to your account</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
