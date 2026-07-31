'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Trial } from '../../types';
import {
  Search,
  Bookmark,
  Clock,
  Award,
  Users,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export const DiscoverTrialsPage: React.FC = () => {
  const {
    trials,
    toggleBookmark,
    applyForTrial,
    setActiveWorkspaceTrial,
    setCurrentRoute,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeModalTrial, setActiveModalTrial] = useState<Trial | null>(null);

  const categories = ['All', 'Frontend', 'AI / ML', 'Backend', 'UI/UX Design', 'Full Stack', 'DevOps'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTrials = trials.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div>
      <Breadcrumbs currentTitle="Discover Trials" />

      {/* Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2-5 Day Paid Industry Trials</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Explore Skill Trials</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Skip traditional screening. Complete micro-trials created by real tech companies to earn stipends and direct internship placements.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trial title, company or skill tag (e.g. React, Python)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trial Cards Grid */}
      {filteredTrials.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Trials Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            No skill trials match your current search criteria or no company trials have been published yet.
          </p>
          {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Reset Filters & Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrials.map((t) => (
            <div
              key={t.id}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Logo, Company & Bookmark */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.logo}
                      alt={t.company}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{t.company}</h4>
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">{t.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBookmark(t.id)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      t.isBookmarked
                        ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                    title="Bookmark Trial"
                  >
                    <Bookmark className={`w-4 h-4 ${t.isBookmarked ? 'fill-purple-600 dark:fill-purple-300' : ''}`} />
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {t.description}
                </p>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {t.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Metadata & Actions */}
              <div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    {t.stipend}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {t.duration}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModalTrial(t)}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => {
                      if (t.status === 'applied' || t.status === 'in_progress') {
                        setActiveWorkspaceTrial(t);
                        setCurrentRoute('workspace');
                      } else {
                        applyForTrial(t.id);
                      }
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                      t.status === 'applied' || t.status === 'in_progress'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                    }`}
                  >
                    {t.status === 'applied' || t.status === 'in_progress' ? 'Open Workspace' : 'Apply Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trial Detail Modal */}
      {activeModalTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalTrial(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={activeModalTrial.logo}
                alt={activeModalTrial.company}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30"
              />
              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {activeModalTrial.company}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeModalTrial.title}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 grid grid-cols-3 gap-3 text-center mb-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Reward Stipend</p>
                <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300">{activeModalTrial.stipend}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Trial Duration</p>
                <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300">{activeModalTrial.duration}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Applicants</p>
                <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300">{activeModalTrial.applicantsCount}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Trial Task Overview</h4>
                <p className="leading-relaxed">{activeModalTrial.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Expected Deliverables</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                  {activeModalTrial.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModalTrial(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  applyForTrial(activeModalTrial.id);
                  setActiveModalTrial(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Apply for Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
