import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components';

export const metadata: Metadata = {
  title: 'Forgot Password | Candidate Portal',
  description: 'Reset your MicroIntern candidate account password.'
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Reset password
        </h2>
        <p className="text-sm text-slate-400">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
