'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterCandidateSchema } from '@microintern/shared';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegisterCandidate } from '@/hooks/useAuth';

import type { z } from 'zod';


type RegisterFormValues = z.infer<typeof RegisterCandidateSchema>;

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const registerMutation = useRegisterCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterCandidateSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[--color-foreground-default]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[--color-muted-foreground]">
          Start completing trials and get hired
        </p>
      </div>

      <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="register-first-name"
            label="First name"
            type="text"
            placeholder="Jane"
            autoComplete="given-name"
            error={errors.firstName?.message}
            required
            {...register('firstName')}
          />
          <Input
            id="register-last-name"
            label="Last name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
            error={errors.lastName?.message}
            required
            {...register('lastName')}
          />
        </div>

        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <div>
          <div className="relative">
            <Input
              id="register-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              required
              {...register('password', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-[--color-muted-foreground] hover:text-[--color-foreground-default] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {passwordRequirements.map(({ label, test }) => {
                const met = test(password);
                return (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 transition-colors ${met ? 'text-[oklch(0.527_0.154_162)]' : 'text-[--color-border]'}`}
                    />
                    <span className={`text-xs ${met ? 'text-[oklch(0.396_0.127_162)]' : 'text-[--color-muted-foreground]'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button
          id="register-submit"
          type="submit"
          size="lg"
          className="w-full"
          isLoading={registerMutation.isPending}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[--color-muted-foreground]">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-semibold text-[oklch(0.55_0.24_264)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
