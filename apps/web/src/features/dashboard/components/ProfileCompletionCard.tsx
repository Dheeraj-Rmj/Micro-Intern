'use client';

import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const completionSteps = [
  {
    title: 'Candidate Account & Email Verification',
    completed: true,
    description: 'Basic account security verified.'
  },
  {
    title: 'Resume Parse & Skill Taxonomy Mapping',
    completed: true,
    description: '14 engineering competencies identified.'
  },
  {
    title: 'First Verified Trial Submission',
    completed: true,
    description: 'Clean Architecture React 19 challenge scored.'
  },
  {
    title: 'GitHub & Portfolio URL Linking',
    completed: false,
    description: 'Connect repository profile for automatic evaluation.'
  }
];

export function ProfileCompletionCard() {
  const percentage = 85;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Candidate Readiness Score
            </h3>
            <p className="text-xs text-slate-400">
              Boost your score to unlock Senior &amp; Staff fast-track pipelines
            </p>
          </div>
        </div>
        <span className="text-2xl font-extrabold text-white">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="mt-6 space-y-3">
        {completionSteps.map((step) => (
          <div
            key={step.title}
            className="flex items-start gap-3 rounded-xl bg-slate-950/40 p-3"
          >
            {step.completed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            )}
            <div className="flex-1">
              <p
                className={`text-xs font-semibold ${
                  step.completed ? 'text-slate-200' : 'text-slate-400'
                }`}
              >
                {step.title}
              </p>
              <p className="text-[11px] text-slate-500">{step.description}</p>
            </div>
            {step.completed ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Done
              </span>
            ) : (
              <Link
                href="/profile"
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                Complete
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>Profile visible to 120+ verified hiring teams</span>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          <span>Edit Candidate Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
