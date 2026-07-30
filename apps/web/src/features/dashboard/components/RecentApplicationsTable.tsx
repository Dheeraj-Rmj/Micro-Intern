'use client';

import Link from 'next/link';
import {
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  company: string;
  role: string;
  assessmentTitle: string;
  status: 'UNDER_REVIEW' | 'ASSESSMENT_ASSIGNED' | 'INTERVIEW_OFFERED' | 'REJECTED';
  submittedAt: string;
  score?: number;
}

const recentApplications: ApplicationItem[] = [
  {
    id: 'app-1',
    company: 'FinTech Cloud Inc.',
    role: 'Senior Frontend Engineer',
    assessmentTitle: 'Design Token Rotation Interceptor & Auth State',
    status: 'INTERVIEW_OFFERED',
    submittedAt: 'July 27, 2026',
    score: 98
  },
  {
    id: 'app-2',
    company: 'Enterprise AI Corp',
    role: 'Principal UI Engineer',
    assessmentTitle: 'Build Responsive Candidate Dashboard Grid',
    status: 'ASSESSMENT_ASSIGNED',
    submittedAt: 'July 25, 2026'
  },
  {
    id: 'app-3',
    company: 'DevTools Studio',
    role: 'React & Next.js Architect',
    assessmentTitle: 'Clean Architecture State Decoupling Challenge',
    status: 'UNDER_REVIEW',
    submittedAt: 'July 20, 2026',
    score: 95
  }
];

const getStatusBadge = (status: ApplicationItem['status']) => {
  switch (status) {
    case 'INTERVIEW_OFFERED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Interview Offered</span>
        </span>
      );
    case 'ASSESSMENT_ASSIGNED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
          <Clock className="h-3.5 w-3.5" />
          <span>Assessment Assigned</span>
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Under Review</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-500/20">
          <span>Closed</span>
        </span>
      );
  }
};

export function RecentApplicationsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Recent Assessment Applications
            </h3>
            <p className="text-xs text-slate-400">
              Track your evaluation progress and interview invitations
            </p>
          </div>
        </div>
        <Link
          href="/applications"
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          <span>View All Applications</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3 font-semibold">Company &amp; Role</th>
              <th className="px-6 py-3 font-semibold">
                Micro-Internship Assessment
              </th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Submitted</th>
              <th className="px-6 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentApplications.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-slate-900/80"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{item.role}</p>
                  <p className="text-xs text-slate-400">{item.company}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-200">
                    {item.assessmentTitle}
                  </p>
                  {item.score !== undefined && (
                    <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                      AI Code Score: {item.score}/100
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {item.submittedAt}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/applications/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
