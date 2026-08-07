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
    <div className="pb-12 text-black dark:text-white max-w-[1200px] mx-auto w-full font-sans">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
        <div>
          <div className="flex items-center gap-3 text-black/40 dark:text-white/50 text-sm font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Paid Trials
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-black dark:text-white">
            Discover Skill Trials
          </h1>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-[32px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trials by role, company, or skill..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-black/5 dark:bg-white/5 border border-transparent text-sm focus:outline-none focus:border-black/10 dark:focus:border-white/10 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trials Grid */}
      {filteredTrials.length === 0 ? (
        <div className="py-24 px-6 text-center rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white flex items-center justify-center mx-auto mb-6">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-2xl tracking-tight text-black dark:text-white font-serif">No matching trials</h3>
          <p className="text-sm text-black/50 dark:text-white/60 max-w-sm mx-auto mt-2 leading-relaxed">
            We could not find any skill trials matching your search or filters. Try resetting your query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
            }}
            className="mt-8 px-6 py-3 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrials.map((trial) => {
            const isBookmarked = trial.isBookmarked;
            return (
              <div
                key={trial.id}
                className="group rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  {/* Top row: Company + Bookmark */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-black/40 dark:text-white/50 uppercase tracking-widest">
                      {trial.company}
                    </span>
                    <button
                      onClick={() => toggleBookmark(trial.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-[#111111] dark:bg-white text-white dark:text-black'
                          : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3 className="text-2xl tracking-tight font-serif text-black dark:text-white mb-3 leading-snug">
                    {trial.title}
                  </h3>

                  <p className="text-xs text-black/60 dark:text-white/70 line-clamp-2 leading-relaxed mb-6">
                    {trial.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {trial.skillsRequired.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-bold text-black/60 dark:text-white/70 uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10 text-xs font-medium text-black/60 dark:text-white/60 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {trial.duration}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                      <Award className="w-3.5 h-3.5 text-black dark:text-white" /> {trial.stipend}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModalTrial(trial)}
                    className="w-full py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm shadow-sm transition-transform group-hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>View Brief & Apply</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trial Brief Modal */}
      {activeModalTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModalTrial(null)} />
          <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[40px] max-w-2xl w-full p-8 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto z-10 text-black dark:text-white">
            <button
              onClick={() => setActiveModalTrial(null)}
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-black/40 dark:text-white/50 uppercase tracking-widest block mb-2">
              {activeModalTrial.company} • {activeModalTrial.category}
            </span>
            <h2 className="text-3xl font-serif text-black dark:text-white mb-4">
              {activeModalTrial.title}
            </h2>
            <p className="text-sm text-black/70 dark:text-white/75 leading-relaxed mb-8">
              {activeModalTrial.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-3xl bg-[#111111] dark:bg-white text-white dark:text-black">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-1">
                  Stipend & Reward
                </span>
                <span className="text-xl font-bold">{activeModalTrial.stipend}</span>
              </div>
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-black/40 dark:text-white/50 uppercase tracking-widest block mb-1">
                  Time Commitment
                </span>
                <span className="text-xl font-bold text-black dark:text-white">{activeModalTrial.duration}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="font-bold text-sm uppercase tracking-widest text-black/60 dark:text-white/60">
                Deliverables Required
              </h4>
              <ul className="space-y-2">
                {[
                  'Clean, documented source code or design files',
                  'Brief 2-minute walkthrough recording of solution',
                  'Test cases or verification checklist',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-black/80 dark:text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/10">
              <button
                onClick={() => setActiveModalTrial(null)}
                className="px-6 py-3 rounded-full font-bold text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  applyForTrial(activeModalTrial.id);
                  setActiveWorkspaceTrial(activeModalTrial);
                  setActiveModalTrial(null);
                  setCurrentRoute('workspace');
                }}
                className="px-8 py-3 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black text-sm font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <span>Start Trial Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
