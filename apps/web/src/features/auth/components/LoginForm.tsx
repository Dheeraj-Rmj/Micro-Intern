'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '../services/auth.service';
import { loginSchema, type LoginFormData } from '../schemas';
import { OAuthButtons } from './OAuthButtons';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (response) => {
      setApiError(null);
      setAuth(response.user, response.accessToken);
      router.replace('/dashboard');
    },
    onError: (error: unknown) => {
      let message = 'Invalid email or password. Please try again.';
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
      setApiError(message);
    }
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError !== null && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{apiError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Email Address
          </label>
          <div className="mt-1.5">
            <input
              id="email"
              type="email"
              placeholder="candidate@example.com"
              {...register('email')}
              disabled={loginMutation.isPending}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            {errors.email !== undefined && (
              <p className="mt-1.5 text-xs font-medium text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={loginMutation.isPending}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password !== undefined && (
            <p className="mt-1.5 text-xs font-medium text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in to candidate portal</span>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-950 px-3 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>

      <OAuthButtons />

      <p className="mt-8 text-center text-sm text-slate-400">
        New to MicroIntern?{' '}
        <Link
          href="/auth/register"
          className="font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:underline"
        >
          Create candidate account
        </Link>
      </p>
    </div>
  );
}
