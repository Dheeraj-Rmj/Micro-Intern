'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckCircle2,
  XCircle,
  FileCode,
  Search,
  ExternalLink,
  Award,
  Filter,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationRow {
  id: string;
  candidateName: string;
  email: string;
  trialTitle: string;
  trustScore: number;
  submittedAt: string;
  githubUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  aiRecommendation: 'STRONG_HIRE' | 'INTERVIEW' | 'REVIEW_NEEDED';
}

const INITIAL_APPS: ApplicationRow[] = [];

export const CompanyApplicationsPage: React.FC = () => {
  const { showToast } = useApp();
  const [apps, setApps] = useState<ApplicationRow[]>(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredApps = apps.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch =
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.trialTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id: string, name: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)));
    showToast('Candidate Approved', `${name} approved for direct interview & stipend!`, 'success');
  };

  const handleReject = (id: string, name: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a)));
    showToast('Candidate Rejected', `${name}'s submission marked as reviewed.`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono text-xs font-bold uppercase tracking-wider">
              APPLICANTS & SUBMISSIONS
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              ENTERPRISE PORTAL
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-black dark:text-white">
            Candidate Skill Trial Applications
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Review completed code submissions from candidates applying to your enterprise apprenticeship trials.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Submissions' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'APPROVED', label: 'Approved & Invited' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates, trials, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-white/40 bg-black/[0.015] dark:bg-white/[0.02]">
                <th className="py-4 px-6">Candidate</th>
                <th className="py-4 px-4">Applied Skill Trial</th>
                <th className="py-4 px-4">AI Trust Score</th>
                <th className="py-4 px-4">AI Recommendation</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-xs">
              {filteredApps.map((a) => (
                <tr key={a.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-black dark:text-white">{a.candidateName}</div>
                    <div className="font-mono text-[11px] text-black/50 dark:text-white/50">{a.email}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-black dark:text-white">
                    {a.trialTitle}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                        a.trustScore >= 95
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {a.trustScore} / 100
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                        a.aiRecommendation === 'STRONG_HIRE'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : a.aiRecommendation === 'INTERVIEW'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {a.aiRecommendation.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={`https://${a.githubUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      {a.githubUrl.split('/')[2] || 'repo'}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {a.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(a.id, a.candidateName)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(a.id, a.candidateName)}
                          className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-black/70 dark:text-white/70 font-semibold text-xs transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : a.status === 'APPROVED' ? (
                      <span className="font-bold text-emerald-500 font-mono text-xs">APPROVED</span>
                    ) : (
                      <span className="font-bold text-rose-500 font-mono text-xs">REJECTED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
