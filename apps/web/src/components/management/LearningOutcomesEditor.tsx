'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface LearningOutcomesEditorProps {
  assessmentId: string;
  roleTitle?: string;
  initialOutcomes?: string[];
  onUpdate?: (outcomes: string[]) => void;
}

const DEFAULT_OUTCOMES = [
  'RESTful API Design & HTTP Status Code conventions',
  'Clean Architecture & Domain-Driven Design layer separation',
  'Authentication & Authorization (JWT / OAuth Token Security)',
  'Database Schema Modeling, Indexing, and Query Optimization',
  'Comprehensive Automated Testing (Unit & Integration suites)',
];

export function LearningOutcomesEditor({
  assessmentId,
  roleTitle = 'Full Stack Engineer',
  initialOutcomes,
  onUpdate,
}: LearningOutcomesEditorProps) {
  const [outcomes, setOutcomes] = useState<string[]>(
    initialOutcomes && initialOutcomes.length > 0 ? initialOutcomes : DEFAULT_OUTCOMES,
  );
  const [newItem, setNewItem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCandidatePreview, setShowCandidatePreview] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const updated = [...outcomes, newItem.trim()];
    setOutcomes(updated);
    setNewItem('');
    onUpdate?.(updated);
  };

  const handleRemove = (index: number) => {
    const updated = outcomes.filter((_, idx) => idx !== index);
    setOutcomes(updated);
    onUpdate?.(updated);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post(`/management/assessments/${assessmentId}/learning-outcomes/generate`, {
        roleTitle,
        description: `Generate enterprise learning outcomes for ${roleTitle}`,
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setOutcomes(response.data.data);
        onUpdate?.(response.data.data);
      }
    } catch (err) {
      console.error('Failed to generate learning outcomes with AI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">Learning Outcomes</h3>
            <p className="text-xs text-slate-400">
              Key competencies & skills the candidate will demonstrate during this enterprise assessment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCandidatePreview(!showCandidatePreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>{showCandidatePreview ? 'Edit Mode' : 'Candidate Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating...' : 'Generate AI Outcomes'}</span>
          </button>
        </div>
      </div>

      {showCandidatePreview ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4 text-purple-400 text-sm font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Candidate Pre-Assessment Display</span>
          </div>
          <h4 className="text-xl font-bold text-white mb-2">What You Will Demonstrate</h4>
          <p className="text-sm text-slate-400 mb-6">
            By completing this assessment assessment, you will prove real-world competency across these critical areas:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outcomes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-200"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* List of Learning Outcomes */}
          <div className="space-y-2.5 mb-6">
            {outcomes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-purple-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-600 cursor-grab group-hover:text-slate-400 transition-colors" />
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove learning outcome"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new outcome form */}
          <form onSubmit={handleAdd} className="flex gap-3 pt-4 border-t border-slate-800">
            <input
              type="text"
              placeholder="Add learning outcome (e.g. Design secure OAuth 2.0 authentication flows)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Outcome</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
