'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Submission } from '../../types';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Code2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const { submissions, trials } = useApp();
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'Evaluated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white dark:bg-white dark:text-black font-bold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/70 font-bold text-[11px] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white dark:bg-white dark:text-black font-bold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/70 font-bold text-[11px] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="pb-12 text-black dark:text-white max-w-[1200px] mx-auto w-full font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
        <div>
          <div className="flex items-center gap-3 text-black/40 dark:text-white/50 text-sm font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Deliverables
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-black dark:text-white">
            Submissions
          </h1>
        </div>

        <div className="px-6 py-3 rounded-full bg-black/5 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm text-black/60 dark:text-white/70 font-bold text-sm flex items-center gap-2">
          <span>Total Submitted: {submissions.length}</span>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="py-24 px-6 text-center rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10">
          <Send className="w-12 h-12 text-black/20 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-black dark:text-white">No submissions yet</h3>
          <p className="text-sm text-black/50 dark:text-white/60 max-w-sm mx-auto mt-2 leading-relaxed">
            When you complete tasks inside an active skill trial workspace and submit your code, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => {
            const trial = trials.find((t) => t.id === sub.trialId);
            return (
              <div
                key={sub.id}
                className="p-6 md:p-8 rounded-[40px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-black/40 dark:text-white/50 uppercase tracking-widest">
                      {trial?.company || 'Company'}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/60">
                      Submitted {sub.submittedAt}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif text-black dark:text-white">
                    {trial?.title || 'Trial Deliverable'}
                  </h3>

                  {sub.repoUrl && (
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{sub.repoUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/10">
                  {sub.score !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-black/40 dark:text-white/50 uppercase tracking-widest">
                        Evaluation Score
                      </p>
                      <p className="text-2xl font-light tracking-tight text-black dark:text-white">
                        {sub.score}%
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {getStatusBadge(sub.status)}

                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="px-6 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSub(null)} />
          <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[40px] max-w-lg w-full p-8 shadow-2xl relative z-10 text-black dark:text-white">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-black/40 dark:text-white/50 uppercase tracking-widest block mb-2">
              Submission Report
            </span>
            <h3 className="text-2xl font-serif text-black dark:text-white mb-6">Evaluation Details</h3>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-black/60 dark:text-white/70">Automated Score</span>
                <span className="font-bold text-2xl text-black dark:text-white">{selectedSub.score}%</span>
              </div>

              {selectedSub.feedback && (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                  <span className="text-xs font-bold text-black/40 dark:text-white/50 uppercase tracking-widest block mb-1">
                    Feedback Note
                  </span>
                  <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed">{selectedSub.feedback}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSub(null)}
              className="w-full py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
