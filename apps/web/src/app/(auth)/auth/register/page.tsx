import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components';

export const metadata: Metadata = {
  title: 'Create Account | Candidate Portal',
  description: 'Register for your MicroIntern candidate account.'
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create candidate account
        </h2>
        <p className="text-sm text-slate-400">
          Start proving your skills with paid micro-internships today.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
