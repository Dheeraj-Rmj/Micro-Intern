'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { assessmentApi, type AssessmentDto } from '@/lib/api/assessment';

export default function AssessmentsDashboardPage() {
  const [assessments, setAssessments] = useState<AssessmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const { assessments: list } = await assessmentApi.listPublicAssessments();
        setAssessments(list || []);
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []);

  const filtered = assessments.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.roleTitle && t.roleTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 antialiased selection:bg-brand-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Enterprise Work Assessment Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Design and publish AI-native competency-based evaluation assessments for technical hiring.
            </p>
          </div>

          <Link
            href="/assessments/new"
            className="rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-brand-500 hover:to-indigo-500 transition-all shadow-brand-500/20"
          >
            + Create New Assessment
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-slate-800 text-slate-100 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assessments by title or role..."
            className="w-72 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Assessment Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-100 group-hover:text-brand-400 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{t.roleTitle || 'Software Engineer'}</p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        t.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(t.skillsRequired || []).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-6 text-xs text-slate-400">
                  <div className="flex items-center space-x-3 font-mono">
                    <span>⏱ {t.durationMinutes}m</span>
                    <span>🎯 {t.passingScore}% pass</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/assessments/${t.id}`}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      Open Studio →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-16 text-center">
            <p className="text-sm text-slate-400">No competency assessments match your search filters.</p>
            <Link
              href="/assessments/new"
              className="inline-block mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              + Create First Assessment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
