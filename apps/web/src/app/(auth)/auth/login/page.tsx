import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components';

export const metadata: Metadata = {
  title: 'Sign In | Candidate Portal',
  description: 'Sign in to your MicroIntern candidate account.'
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="text-sm text-slate-400">
          Sign in to access your micro-internships and evaluations.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
