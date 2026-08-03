'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  FileCode,
  Check,
  X,
  Zap,
} from 'lucide-react';

interface AdminTrialRow {
  id: string;
  title: string;
  company: string;
  stipend: string;
  candidate: string;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'REVIEW_PENDING';
  aiScore: number;
  submittedAt: string;
  category: string;
}

const INITIAL_TRIALS: AdminTrialRow[] = [];

export const SuperAdminTrialsPage: React.FC = () => {
  const { showToast } = useApp();
  const [trials, setTrials] = useState<AdminTrialRow[]>(INITIAL_TRIALS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOCKED' | 'REVIEW_PENDING' | 'DISPUTED' | 'RELEASED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrialRubric, setSelectedTrialRubric] = useState<AdminTrialRow | null>(null);

  const filteredTrials = trials.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.escrowStatus === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReleaseEscrow = (id: string, candidate: string, stipend: string) => {
    setTrials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, escrowStatus: 'RELEASED' } : t))
    );
    showToast(
      'Stripe Escrow Released',
      `Transferred ${stipend} to candidate ${candidate}. Transaction ID logged.`,
      'success'
    );
  };

  const handleResolveDispute = (id: string, action: 'candidate' | 'company') => {
    setTrials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, escrowStatus: 'RELEASED' } : t))
    );
    showToast(
      'Dispute Resolved',
      `Escrow award settled in favor of ${action === 'candidate' ? 'Candidate' : 'Company Partner'}.`,
      'info'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider">
              ESCROW GOVERNANCE
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-[#E1E0CC]/50">
              STRIPE CONNECT TREASURY
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-[#E1E0CC]">
            Global Trials & Escrow
          </h1>
          <p className="text-sm text-black/60 dark:text-[#E1E0CC]/70 mt-1">
            Audit live apprenticeship trials, inspect AI automated evaluation rubrics, and manage escrow disbursements.
          </p>
        </div>

        {/* Financial Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">In Escrow Pool</div>
            <div className="text-base font-bold font-mono text-black dark:text-[#E1E0CC]">$1,420,850</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">Active Disputes</div>
            <div className="text-base font-bold font-mono text-amber-500">1</div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Trials (412)' },
            { id: 'REVIEW_PENDING', label: 'Pending Release (14)' },
            { id: 'DISPUTED', label: 'Disputed (1)' },
            { id: 'LOCKED', label: 'In Escrow (397)' },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black dark:bg-[#E1E0CC] text-white dark:text-black shadow-md'
                    : 'text-black/60 dark:text-[#E1E0CC]/60 hover:text-black dark:hover:text-white'
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
            placeholder="Search trials, enterprise, candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#101010] border border-black/10 dark:border-white/10 text-xs text-black dark:text-[#E1E0CC] focus:outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ── Trials Table ── */}
      <div className="rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-[#E1E0CC]/40 bg-black/[0.015] dark:bg-white/[0.02]">
                <th className="py-4 px-6">Apprenticeship Trial</th>
                <th className="py-4 px-4">Enterprise</th>
                <th className="py-4 px-4">Stipend</th>
                <th className="py-4 px-4">Assigned Candidate</th>
                <th className="py-4 px-4">AI Score</th>
                <th className="py-4 px-4">Escrow State</th>
                <th className="py-4 px-6 text-right">Escrow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-xs">
              {filteredTrials.map((trial) => (
                <tr
                  key={trial.id}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-semibold text-black dark:text-[#E1E0CC] text-sm block">
                        {trial.title}
                      </span>
                      <span className="text-black/50 dark:text-[#E1E0CC]/50 font-mono text-[11px]">
                        {trial.id} • {trial.category}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-black dark:text-[#E1E0CC]">
                    {trial.company}
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-black dark:text-[#E1E0CC]">
                    {trial.stipend}
                  </td>

                  <td className="py-4 px-4 text-black/70 dark:text-[#E1E0CC]/80">
                    {trial.candidate}
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedTrialRubric(trial)}
                      className="px-2.5 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 font-mono font-bold text-black dark:text-[#E1E0CC] hover:border-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{trial.aiScore}/100</span>
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] uppercase ${
                        trial.escrowStatus === 'RELEASED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : trial.escrowStatus === 'REVIEW_PENDING'
                          ? 'bg-blue-500/10 text-blue-500'
                          : trial.escrowStatus === 'DISPUTED'
                          ? 'bg-red-500/10 text-red-500 animate-pulse'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {trial.escrowStatus}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {trial.escrowStatus === 'REVIEW_PENDING' && (
                        <button
                          onClick={() => handleReleaseEscrow(trial.id, trial.candidate, trial.stipend)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Release Stipend</span>
                        </button>
                      )}

                      {trial.escrowStatus === 'DISPUTED' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleResolveDispute(trial.id, 'candidate')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-mono text-[11px] font-bold cursor-pointer"
                          >
                            Award Candidate
                          </button>
                          <button
                            onClick={() => handleResolveDispute(trial.id, 'company')}
                            className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-mono text-[11px] font-bold cursor-pointer"
                          >
                            Refund Company
                          </button>
                        </div>
                      )}

                      {trial.escrowStatus === 'RELEASED' && (
                        <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stripe Paid</span>
                        </span>
                      )}

                      {trial.escrowStatus === 'LOCKED' && (
                        <button
                          onClick={() => handleReleaseEscrow(trial.id, trial.candidate, trial.stipend)}
                          className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-black dark:text-[#E1E0CC] transition-colors cursor-pointer"
                        >
                          Force Unlock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AI Automated Rubric Modal ── */}
      {selectedTrialRubric && (
        <div
          onClick={() => setSelectedTrialRubric(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#101010] border border-black/10 dark:border-white/10 rounded-[32px] p-7 max-w-lg w-full shadow-2xl text-[#111111] dark:text-[#E1E0CC]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>AI Verification Rubric • {selectedTrialRubric.id}</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs">
                Score: {selectedTrialRubric.aiScore} / 100
              </span>
            </div>

            <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70 mb-5 leading-relaxed">
              Automated evaluation breakdown for <strong>{selectedTrialRubric.candidate}</strong> on trial <em>{selectedTrialRubric.title}</em>.
            </p>

            <div className="space-y-3 mb-6 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                <span>1. GitHub Unit Test Coverage (35% wgt)</span>
                <span className="font-bold text-emerald-500">100% Passed</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                <span>2. Code Cleanliness & ESLint/Biome</span>
                <span className="font-bold text-emerald-500">98 / 100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                <span>3. LLM Plagiarism Similarity Check</span>
                <span className="font-bold text-blue-500">0.02% (Unique)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                <span>4. Architectural Efficiency Rubric</span>
                <span className="font-bold text-amber-500">94 / 100</span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setSelectedTrialRubric(null)}
                className="px-5 py-2.5 rounded-xl bg-black dark:bg-[#E1E0CC] text-white dark:text-black font-semibold text-xs uppercase tracking-wider shadow-md transition-opacity cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
