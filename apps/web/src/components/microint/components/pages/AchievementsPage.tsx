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
    <div>
      <Breadcrumbs currentTitle="Achievements" />

      {/* Trust Score Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-purple-800 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Proof-of-Talent Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">Trust Score: {userProfile.trustScore} / 100</h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
              Calculated from 100% passed test cases, verified GitHub repo connection, and completed trial deliverables.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-purple-200">Percentile Rank</p>
            <p className="text-3xl font-black text-amber-300 mt-1">Top 5%</p>
            <p className="text-[11px] text-purple-200 mt-1">Candidate Ecosystem</p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mb-10">
        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <span>Unlocked Badges & Specializations</span>
        </h2>

        {achievements.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Badges Unlocked Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Complete trial workspaces and submit code deliverables to earn skill badges and raise your Trust Score.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {achievements.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                      {b.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{b.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{b.category}</span>
                  <span>Unlocked {b.unlockedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Certificates & Completed Trials */}
      <div>
        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Verified MicroIntern Completion Certificates</span>
        </h2>

        <div className="space-y-4">
          {completedTrials.length > 0 ? (
            completedTrials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img src={t.logo} alt={t.company} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200" />
                  <div>
                    <span className="text-xs font-bold text-purple-600 uppercase">{t.company}</span>
                    <h3 className="text-base font-bold">{t.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Verified Completion • Stipend Reward Claimed</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadCertificate(t.title)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Award className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="font-bold text-base">Complete your first workspace trial!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Finish active workspace tasks to generate official verifiable PDF certificates for your portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
