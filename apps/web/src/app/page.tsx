'use client';

import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Code2,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  Sparkles,
  Terminal,
  FileCode,
  Briefcase
} from 'lucide-react';

export default function CandidateLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                MicroIntern
              </span>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                Candidate Portal
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-white"
            >
              How It Works
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a
              href="#testimonials"
              className="transition-colors hover:text-white"
            >
              Success Stories
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 blur-[140px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Candidate Portal &bull; Enterprise Architecture 2026</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
            Skip the resume black hole.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Prove your engineering skills.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Complete short, verified micro-internships from top engineering
            teams. Get evaluated on real code quality, build your portfolio, and
            earn direct interview fast-tracks.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500 sm:w-auto"
            >
              <span>Create Candidate Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800 sm:w-auto"
            >
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Feature highlights bar */}
          <div className="mt-16 grid grid-cols-1 gap-6 border-y border-slate-800/80 py-8 text-left sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Real Code Evaluation
                </h3>
                <p className="text-xs text-slate-400">
                  Judged on architecture, tests, and clean code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Verified Skill Tags
                </h3>
                <p className="text-xs text-slate-400">
                  Backed by completed trial submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Direct Interview Fast-Track
                </h3>
                <p className="text-xs text-slate-400">
                  Bypass initial recruiter screening rounds
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              How MicroIntern Works
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three steps from trial submission to job offer
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md transition-all hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 font-bold">
                01
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                Browse Verified Trials
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Explore paid micro-internships and real-world engineering tasks
                published by verified hiring managers and tech leads.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Terminal className="h-4 w-4" />
                <span>React, Node.js, Python, PostgreSQL</span>
              </div>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md transition-all hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 font-bold">
                02
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                Submit Production Artifacts
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Write clean architecture code, attach unit tests, and submit
                your solution directly to our automated evaluation pipeline.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <FileCode className="h-4 w-4" />
                <span>Automated syntax &amp; lint verification</span>
              </div>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md transition-all hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 font-bold">
                03
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                Get Hired Faster
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Top-scoring candidates bypass HR screens and receive immediate
                interview invitations with engineering decision-makers.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-400">
                <Briefcase className="h-4 w-4" />
                <span>Direct pipeline stage progression</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Success Stories
            </h2>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Candidates hired through real code, not keywords
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
                  SR
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Sarah Jenkins
                  </h4>
                  <p className="text-xs text-slate-400">
                    Senior Frontend Engineer
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                &ldquo;Traditional resume screeners always filtered me out
                because of my non-traditional background. MicroIntern allowed me
                to demonstrate my React 19 and Next.js skills directly.&rdquo;
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold">
                  AK
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Alex Kumar
                  </h4>
                  <p className="text-xs text-slate-400">Full-Stack Engineer</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                &ldquo;The trial evaluation score gave me verified proof of my
                backend architecture abilities. Within 10 days I had two formal
                job offers.&rdquo;
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold">
                  ML
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Marcus Lee
                  </h4>
                  <p className="text-xs text-slate-400">
                    TypeScript &amp; Node.js Engineer
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                &ldquo;Clean architecture and strict TypeScript are what I love
                building. MicroIntern connected me with a team that values high
                engineering standards.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to prove your engineering talent?
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Join thousands of candidates using MicroIntern to bypass recruiter
            screens and land their next engineering role.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500"
            >
              <span>Create Free Candidate Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-sm text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-12">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-white">
              MicroIntern Candidate Portal
            </span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} MicroIntern Inc. All rights
            reserved. Candidate-First Public Architecture.
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
