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
import { registerSchema, type RegisterFormData } from '../schemas';
import { OAuthButtons } from './OAuthButtons';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: (response) => {
      setApiError(null);
      setAuth(response.user, response.accessToken);
      router.replace('/dashboard');
    },
    onError: (error: unknown) => {
      let message = 'Failed to register account. Please try again.';
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

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              First Name
            </label>
            <div className="mt-1.5">
              <input
                id="firstName"
                type="text"
                placeholder="Ada"
                {...register('firstName')}
                disabled={registerMutation.isPending}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
              {errors.firstName !== undefined && (
                <p className="mt-1.5 text-xs font-medium text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Last Name
            </label>
            <div className="mt-1.5">
              <input
                id="lastName"
                type="text"
                placeholder="Lovelace"
                {...register('lastName')}
                disabled={registerMutation.isPending}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
              {errors.lastName !== undefined && (
                <p className="mt-1.5 text-xs font-medium text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
        </div>

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
              disabled={registerMutation.isPending}
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
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={registerMutation.isPending}
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Confirm Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={registerMutation.isPending}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword !== undefined && (
            <p className="mt-1.5 text-xs font-medium text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register('acceptTerms')}
            disabled={registerMutation.isPending}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="acceptTerms" className="text-xs text-slate-400">
            I agree to the{' '}
            <span className="font-medium text-slate-200 underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-medium text-slate-200 underline">
              Privacy Policy
            </span>
          </label>
        </div>
        {errors.acceptTerms !== undefined && (
          <p className="text-xs font-medium text-red-400">
            {errors.acceptTerms.message}
          </p>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating candidate account...</span>
            </>
          ) : (
            <span>Create candidate account</span>
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
        Already have a candidate account?{' '}
        <Link
          href="/auth/login"
          className="font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
