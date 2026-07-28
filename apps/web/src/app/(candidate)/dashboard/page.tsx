'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import {
  StatCards,
  ProfileCompletionCard,
  ResumeStatusCard,
  RecentApplicationsTable,
  UpcomingInterviewsCard
} from '@/features/dashboard/components';

export default function CandidateDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Candidate Engineering Portal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome back, {user?.firstName ?? 'Candidate'}!
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here is your verified micro-internship evaluation summary and trial
            activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/resume"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>Update Resume</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Edit Profile</span>
          </Link>

          <Link
            href="/applications"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Browse Trials</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Top statistics metrics */}
      <StatCards />

      {/* Main dashboard cards grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileCompletionCard />
          <ResumeStatusCard />
        </div>
        <div className="lg:col-span-1">
          <UpcomingInterviewsCard />
        </div>
      </div>

      {/* Recent trial applications table */}
      <RecentApplicationsTable />
    </div>
  );
}
