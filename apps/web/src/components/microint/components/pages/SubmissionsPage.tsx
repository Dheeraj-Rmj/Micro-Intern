'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Submission } from '../../types';
import {
  Send,
  FileCheck,
  Download,
  Eye,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const { submissions, showToast } = useApp();
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const handleDownloadReport = (subTitle: string) => {
    showToast('Report Downloaded', `Generated evaluation summary for "${subTitle}".`, 'success');
  };

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
          </span>
        );
    }
  };

  return (
    <div>
      <Breadcrumbs currentTitle="Submissions" />

      {/* Header */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Trial Submission History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review past workspace deliverables, automated evaluator feedback, and download completion receipts.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs">
          Total Submissions: {submissions.length}
        </div>
      </div>

      {/* Submissions Cards */}
      {submissions.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Submissions Recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            You haven&apos;t submitted any completed trial deliverables or code repositories yet. Complete tasks in the trial workspace to see submissions here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {sub.company}
                  </span>
                  <span className="text-xs font-mono text-slate-400">• Submitted {sub.submittedAt}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {sub.trialTitle}
                </h3>

                {sub.feedback && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    &quot;{sub.feedback}&quot;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                {sub.score !== undefined && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Evaluation Score</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{sub.score}%</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {getStatusBadge(sub.status)}

                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="View Submission Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadReport(sub.trialTitle)}
                    className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200 transition-colors cursor-pointer"
                    title="Download Evaluation Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedSub.company}</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">{selectedSub.trialTitle}</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted Date</span>
                  <span className="font-bold">{selectedSub.submittedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedSub.status}</span>
                </div>
                {selectedSub.score && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Evaluator Score</span>
                    <span className="font-black text-emerald-600">{selectedSub.score}%</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Attached Files</h4>
                <div className="space-y-2">
                  {selectedSub.fileNames.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="font-mono text-xs flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {f}
                      </span>
                      <button
                        onClick={() => handleDownloadReport(f)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
