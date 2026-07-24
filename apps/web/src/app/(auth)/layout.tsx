import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap } from 'lucide-react';

/**
 * Auth portal layout — minimal, clean, centered form layout.
 * Applied to: /auth/login, /auth/register, /auth/forgot-password, etc.
 */
export const metadata: Metadata = {
  title: { absolute: 'Sign In | MicroIntern' },
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.08) 0%, transparent 60%), radial-gradient(circle at 70% 80%, oklch(0 0 0 / 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">MicroIntern</span>
        </div>

        {/* Quote */}
        <div className="relative">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium text-white leading-relaxed">
              "MicroIntern helped me land a senior role at a Series B startup —
              and I didn't submit a single resume."
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                SR
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sarah R.</p>
                <p className="text-sm text-white/70">Senior Frontend Engineer, hired via MicroIntern</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient-brand">MicroIntern</span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-center text-[--color-muted-foreground]">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-[--color-foreground-default]">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-[--color-foreground-default]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
