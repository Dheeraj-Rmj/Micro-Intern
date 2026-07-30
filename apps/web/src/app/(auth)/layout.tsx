import { ReactNode } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Zap, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { GuestRoute } from '@/components/auth/GuestRoute';

export const metadata: Metadata = {
  title: 'Candidate Authentication | MicroIntern',
  description:
    'Sign in or register for the MicroIntern Candidate Portal to browse micro-internships and assessment evaluations.'
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestRoute>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MicroIntern
              </span>
            </Link>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
              Candidate Portal
            </span>
          </div>

          <div className="relative z-10 my-auto max-w-lg space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Prove your skills with real-world micro-internships.
              </h1>
              <p className="text-base text-slate-400">
                Skip traditional resume screening. Complete short paid assessments,
                showcase your engineering capabilities, and get hired by top
                companies.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span>100% verified employer assessment evaluations</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span>AI-assisted resume and skill tagging engine</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Award className="h-5 w-5 text-blue-400" />
                <span>Direct fast-track pipeline to hiring teams</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md">
              <p className="text-sm italic text-slate-300">
                &ldquo;MicroIntern allowed me to demonstrate my React and
                TypeScript skills directly. I received a senior role offer
                within two weeks of completing my assessment.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
                  SR
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Sarah R.</p>
                  <p className="text-xs text-slate-400">
                    Senior Frontend Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
            <p>&copy; 2026 MicroIntern Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <Link
                href="/"
                className="transition-colors hover:text-slate-300"
              >
                Home
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-slate-300"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-slate-300"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-950 px-6 py-12 text-white lg:px-12">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MicroIntern</span>
            </Link>
          </div>

          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </GuestRoute>
  );
}
