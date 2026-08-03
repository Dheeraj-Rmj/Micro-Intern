'use client';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  Award,
  ShieldCheck,
  Zap,
  Sparkles,
  Code2,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements, userProfile, trials, showToast } = useApp();

  const completedTrials = trials.filter((t) => t.status === 'completed');

  const handleDownloadCertificate = (certName: string) => {
    showToast('Certificate Downloaded', `Generated PDF badge certificate for "${certName}".`, 'success');
  };

  return (
    <div className="pb-12 text-[#111111] dark:text-[#E1E0CC] max-w-[1200px] mx-auto w-full font-sans">
      <Breadcrumbs currentTitle="Achievements" />

      {/* Trust Score Banner */}
      <div className="mb-12 p-8 sm:p-10 rounded-[40px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E1E0CC]/15 dark:bg-[#E1E0CC]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E1E0CC]/15 dark:bg-[#E1E0CC]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-bold tracking-widest uppercase mb-4 text-black/60 dark:text-[#E1E0CC]/70">
              <ShieldCheck className="w-4 h-4 text-[#111111] dark:text-[#E1E0CC]" />
              <span>Verified Proof-of-Talent</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-black dark:text-[#E1E0CC]">
              Trust Score: <span className="font-semibold text-[#111111] dark:text-[#E1E0CC]">{userProfile.trustScore}</span>{' '}
              <span className="text-2xl text-black/40 dark:text-[#E1E0CC]/40">/ 100</span>
            </h1>
            <p className="mt-4 text-sm text-black/60 dark:text-[#E1E0CC]/70 font-medium max-w-xl leading-relaxed">
              Calculated from passed test cases, verified GitHub repo connection, and completed trial deliverables.
            </p>
          </div>

          <div className="p-8 rounded-[32px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center min-w-[200px]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-[#E1E0CC]/50">
              Percentile Rank
            </p>
            <p className="text-4xl font-serif tracking-tight text-black dark:text-[#E1E0CC] mt-2">Top 5%</p>
            <p className="text-[11px] font-bold text-[#111111] dark:text-[#E1E0CC] uppercase tracking-widest mt-2">
              Candidate Ecosystem
            </p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-serif tracking-tight mb-6 flex items-center gap-3 text-black dark:text-[#E1E0CC] border-b border-black/5 dark:border-white/10 pb-4">
          <Award className="w-5 h-5 text-[#111111] dark:text-[#E1E0CC]" />
          <span>Unlocked Badges</span>
        </h2>

        {achievements.length === 0 ? (
          <div className="py-24 px-6 text-center rounded-[40px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm">
            <Sparkles className="w-10 h-10 text-[#111111] dark:text-[#E1E0CC] mx-auto mb-4" />
            <h3 className="text-2xl font-serif tracking-tight text-black dark:text-[#E1E0CC]">No Badges Yet</h3>
            <p className="text-sm text-black/50 dark:text-[#E1E0CC]/60 max-w-sm mx-auto mt-2 font-medium">
              Complete trial workspaces and submit code deliverables to earn skill badges and raise your Trust Score.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-[32px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#111111] dark:text-[#E1E0CC] group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#111111] dark:bg-[#E1E0CC] text-white dark:text-black uppercase tracking-widest shadow-sm">
                      {b.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif tracking-tight text-black dark:text-[#E1E0CC] mb-2 leading-tight">
                    {b.title}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70 font-medium leading-relaxed mb-6">
                    {b.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-black/40 dark:text-[#E1E0CC]/50 uppercase tracking-widest">
                    {b.category}
                  </span>
                  <span className="text-[10px] font-bold text-[#111111] dark:text-[#E1E0CC] uppercase tracking-widest">
                    Unlocked {b.unlockedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Certificates & Completed Trials */}
      <div>
        <h2 className="text-2xl font-serif tracking-tight mb-6 flex items-center gap-3 text-black dark:text-[#E1E0CC] border-b border-black/5 dark:border-white/10 pb-4">
          <CheckCircle2 className="w-5 h-5 text-[#111111] dark:text-[#E1E0CC]" />
          <span>Verified Certificates</span>
        </h2>

        <div className="grid gap-4">
          {completedTrials.length > 0 ? (
            completedTrials.map((t) => (
              <div
                key={t.id}
                className="p-6 md:p-8 rounded-[40px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={t.logo}
                    alt={t.company}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/10"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-black/40 dark:text-[#E1E0CC]/50 uppercase tracking-widest">
                      {t.company}
                    </span>
                    <h3 className="text-2xl font-serif tracking-tight text-black dark:text-[#E1E0CC] leading-tight mt-1">
                      {t.title}
                    </h3>
                    <p className="text-xs font-bold text-[#111111] dark:text-[#E1E0CC] uppercase tracking-widest mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Completion
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadCertificate(t.title)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#111111] dark:bg-[#E1E0CC] text-white dark:text-black font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 rounded-[40px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 text-center shadow-sm">
              <Award className="w-12 h-12 text-[#111111] dark:text-[#E1E0CC] mx-auto mb-4" />
              <h3 className="text-2xl font-serif tracking-tight text-black dark:text-[#E1E0CC]">
                Complete your first workspace trial!
              </h3>
              <p className="text-sm text-black/50 dark:text-[#E1E0CC]/60 max-w-md mx-auto mt-2 font-medium">
                Finish active workspace tasks to generate official verifiable PDF certificates for your portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
