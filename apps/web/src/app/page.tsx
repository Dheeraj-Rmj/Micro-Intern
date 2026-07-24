import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Users, Code2, Briefcase } from 'lucide-react';

/**
 * Homepage — Candidate Portal landing page.
 *
 * This is a Server Component — all data fetching happens server-side.
 * No useEffect, no useState, no client-side loading states.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[--color-background-default]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.55 0.24 264 / 0.15), transparent)',
          }}
        />

        {/* Nav */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient-brand">MicroIntern</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[--color-muted-foreground]">
            <Link href="#features" className="hover:text-[--color-foreground-default] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[--color-foreground-default] transition-colors">How it Works</Link>
            <Link href="/company" className="hover:text-[--color-foreground-default] transition-colors">For Companies</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[--color-muted-foreground] hover:text-[--color-foreground-default] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-[--shadow-sm] transition-all hover:opacity-90 hover:shadow-[--shadow-glow]"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-32 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-muted] px-4 py-1.5 text-sm text-[--color-muted-foreground]">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.527_0.154_162)]" />
            Now in beta — free for candidates
          </div>

          <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Get hired by{' '}
            <span className="text-gradient-brand">what you can do</span>
            {', '}
            not your resume
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-[--color-muted-foreground] leading-relaxed">
            MicroIntern connects talented candidates with top companies through real-world skill
            trials. No ATS filters. No resume black holes. Just your work, speaking for itself.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=candidate"
              className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-8 py-4 text-base font-semibold text-white shadow-[--shadow-md] transition-all hover:opacity-90 hover:shadow-[--shadow-glow] hover:scale-105"
            >
              Start as a Candidate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register?role=company"
              className="flex items-center justify-center gap-2 rounded-xl border border-[--color-border] bg-[--color-card] px-8 py-4 text-base font-semibold text-[--color-foreground-default] shadow-[--shadow-sm] transition-all hover:bg-[--color-muted] hover:shadow-[--shadow-md]"
            >
              <Briefcase className="h-4 w-4" />
              Hire with Trials
            </Link>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <section className="border-y border-[--color-border] bg-[--color-muted]">
        <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Candidates', value: '12,000+' },
            { label: 'Companies Hiring', value: '340+' },
            { label: 'Trials Completed', value: '48,000+' },
            { label: 'Avg. Time to Offer', value: '6 days' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient-brand">{value}</p>
              <p className="mt-1 text-sm text-[--color-muted-foreground]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to hire smarter
          </h2>
          <p className="text-[--color-muted-foreground] max-w-xl mx-auto">
            AI-powered evaluations, structured pipelines, and real work samples — all in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[--color-border] bg-[--color-card] p-6 transition-all hover:shadow-[--shadow-lg] hover:border-[oklch(0.55_0.24_264_/_0.3)] hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-[--color-foreground-default]">{feature.title}</h3>
              <p className="text-sm text-[--color-muted-foreground] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[--color-muted] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-[--color-muted-foreground]">From trial to offer in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-xl font-bold text-white shadow-[--shadow-glow]">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-[--color-muted-foreground] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="mb-4 text-3xl md:text-4xl font-bold">
          Ready to find your next role?
        </h2>
        <p className="mb-8 text-[--color-muted-foreground]">
          Join thousands of candidates who landed jobs through real work — not resume keywords.
        </p>
        <Link
          href="/auth/register?role=candidate"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-10 py-4 text-base font-semibold text-white shadow-[--shadow-lg] transition-all hover:opacity-90 hover:shadow-[--shadow-glow] hover:scale-105"
        >
          Create Your Free Account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[--color-border] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-brand">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm">MicroIntern</span>
          </div>
          <p className="text-sm text-[--color-muted-foreground]">
            © {new Date().getFullYear()} MicroIntern. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[--color-muted-foreground]">
            <Link href="/privacy" className="hover:text-[--color-foreground-default] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[--color-foreground-default] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[--color-foreground-default] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Code2,
    title: 'Real-World Trials',
    description: 'Complete short, paid skill trials crafted by the company. Show what you can actually do.',
  },
  {
    icon: Zap,
    title: 'AI Evaluation',
    description: 'Instant, consistent, unbiased evaluation of every submission. Get feedback in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Pipeline',
    description: 'Always know where you stand. No ghosting, no black holes — real-time status updates.',
  },
  {
    icon: Shield,
    title: 'Bias-Free Screening',
    description: 'Evaluated on your work, not your name, school, or resume format.',
  },
  {
    icon: Users,
    title: 'Company Profiles',
    description: 'Research companies before applying. See team culture, tech stack, and trial difficulty.',
  },
  {
    icon: Briefcase,
    title: 'Direct Offers',
    description: 'Top performers receive direct offers. Skip the interview rounds.',
  },
];

const steps = [
  {
    title: 'Browse & Apply',
    description: 'Discover trials from companies hiring for roles that match your skills and interests.',
  },
  {
    title: 'Complete the Trial',
    description: 'Submit your work in 2-7 days. Our AI gives you detailed feedback immediately.',
  },
  {
    title: 'Get Hired',
    description: 'Top submissions go straight to the company. The best candidates get fast-tracked to offers.',
  },
];
