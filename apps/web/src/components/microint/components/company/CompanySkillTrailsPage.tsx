"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { companyApi } from "../../../../lib/api/company";
import {
  Sparkles,
  Save,
  Wand2,
  Settings,
  Target,
  BrainCircuit,
  Bot,
  Activity,
  Award,
  CheckCircle2
} from "lucide-react";

export const CompanySkillTrailsPage: React.FC = () => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    roleProfileId: "00000000-0000-0000-0000-000000000000", // placeholder UUID
    title: "",
    numberOfQuestions: 15,
    assessmentDurationMinutes: 60,
    passingScore: 75,
    requiredPerformance: "Above Average",
    aiGenerateQuestions: true,
    autoEvaluate: true,
    aiRecommendTask: true,
    easy: 30,
    medium: 50,
    hard: 20,
    enableLearningPlan: true,
    enableWeakSkillAnalysis: true,
    enableAlternativeRoles: false,
  });

  const [blueprint, setBlueprint] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      finalValue = parseInt(value, 10) || 0;
    }
    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await companyApi.configureSkillTrail({
        roleProfileId: form.roleProfileId,
        title: form.title || "Untitled AI Skill Trail",
        configuration: {
          aiGenerateQuestions: form.aiGenerateQuestions,
          numberOfQuestions: form.numberOfQuestions,
          assessmentDurationMinutes: form.assessmentDurationMinutes,
          difficultyDistribution: {
            easy: form.easy,
            medium: form.medium,
            hard: form.hard,
          },
          passingScore: form.passingScore,
          requiredPerformance: form.requiredPerformance,
          autoEvaluate: form.autoEvaluate,
          aiRecommendTask: form.aiRecommendTask,
          candidateFeedback: {
            enableLearningPlan: form.enableLearningPlan,
            enableWeakSkillAnalysis: form.enableWeakSkillAnalysis,
            enableAlternativeRoles: form.enableAlternativeRoles,
          }
        }
      });
      showToast("Success", "Skill Trail Configuration saved successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Error", err.response?.data?.error?.message || "Failed to save configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    setGenerating(true);
    try {
      const res = await companyApi.generateAssessmentBlueprint({
        roleProfile: form.title || "General Role",
        competencies: "Problem Solving, System Design, Algorithms", // mock
        configurationRules: {
          numberOfQuestions: form.numberOfQuestions,
          passingScore: form.passingScore,
          difficultyDistribution: {
            easy: form.easy,
            medium: form.medium,
            hard: form.hard,
          }
        }
      });
      setBlueprint(res.data);
      showToast("Blueprint Generated", "AI successfully generated the assessment blueprint.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Error", "Failed to generate blueprint", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              AI AUTOMATION
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              PHASE 5 FEATURES
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-black dark:text-white">
            Skill Trails Configuration
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Configure AI-driven progression rules and automated assessment generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateBlueprint}
            disabled={generating}
            className="px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {generating ? <Wand2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>Preview Blueprint</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-7 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-black dark:text-white border-b border-black/5 dark:border-white/10 pb-4">
              <Settings className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold font-serif">Trail Basics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Trail Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Engineering"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Role Profile ID</label>
                <input
                  type="text"
                  name="roleProfileId"
                  value={form.roleProfileId}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-7 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-black dark:text-white border-b border-black/5 dark:border-white/10 pb-4">
              <Target className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold font-serif">Assessment Generation Rules</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Number of Questions</label>
                <input
                  type="number"
                  name="numberOfQuestions"
                  value={form.numberOfQuestions}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Duration (Minutes)</label>
                <input
                  type="number"
                  name="assessmentDurationMinutes"
                  value={form.assessmentDurationMinutes}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/10">
              <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-3">Difficulty Distribution (%)</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-black/50 dark:text-white/50 mb-1">Easy</label>
                  <input
                    type="number"
                    name="easy"
                    value={form.easy}
                    onChange={handleChange}
                    className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black/50 dark:text-white/50 mb-1">Medium</label>
                  <input
                    type="number"
                    name="medium"
                    value={form.medium}
                    onChange={handleChange}
                    className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-sm text-amber-600 dark:text-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black/50 dark:text-white/50 mb-1">Hard</label>
                  <input
                    type="number"
                    name="hard"
                    value={form.hard}
                    onChange={handleChange}
                    className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 text-sm text-rose-600 dark:text-rose-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-black dark:text-white border-b border-black/5 dark:border-white/10 pb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold font-serif">Progression Rules</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Minimum Passing Score (%)</label>
                <input
                  type="number"
                  name="passingScore"
                  value={form.passingScore}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-black/60 dark:text-white/60 mb-1.5">Required AI Classification</label>
                <select
                  name="requiredPerformance"
                  value={form.requiredPerformance}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="Exceptional">Exceptional</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Above Average">Above Average</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Below Average">Below Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-7 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-black dark:text-white border-b border-black/5 dark:border-white/10 pb-4">
              <Bot className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold font-serif">AI Automation</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    name="aiGenerateQuestions"
                    checked={form.aiGenerateQuestions}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-lg border-2 border-black/20 dark:border-white/20 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black dark:text-white group-hover:text-emerald-500 transition-colors">AI Generates Questions</p>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Automatically pull dynamic questions from AI Engine</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    name="autoEvaluate"
                    checked={form.autoEvaluate}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-lg border-2 border-black/20 dark:border-white/20 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black dark:text-white group-hover:text-emerald-500 transition-colors">Auto-Evaluate Candidates</p>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Progress or reject candidates without recruiter review</p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/10">
              <h3 className="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                Candidate Feedback
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-black/70 dark:text-white/70 hover:text-indigo-500 transition-colors">
                  <input type="checkbox" name="enableLearningPlan" checked={form.enableLearningPlan} onChange={handleChange} className="rounded border-black/20" />
                  Generate AI Learning Plan
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-black/70 dark:text-white/70 hover:text-indigo-500 transition-colors">
                  <input type="checkbox" name="enableWeakSkillAnalysis" checked={form.enableWeakSkillAnalysis} onChange={handleChange} className="rounded border-black/20" />
                  Detailed Weak Skill Analysis
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-black/70 dark:text-white/70 hover:text-indigo-500 transition-colors">
                  <input type="checkbox" name="enableAlternativeRoles" checked={form.enableAlternativeRoles} onChange={handleChange} className="rounded border-black/20" />
                  Recommend Alternative Roles
                </label>
              </div>
            </div>
          </div>

          {blueprint && (
            <div className="p-7 rounded-[32px] bg-indigo-500/5 border border-indigo-500/20 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
              <h3 className="text-sm font-bold font-serif text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Blueprint Preview
              </h3>
              <div className="bg-black/5 dark:bg-black/40 rounded-xl p-4 overflow-auto max-h-[300px]">
                <pre className="text-[10px] font-mono text-black/70 dark:text-white/70">
                  {JSON.stringify(blueprint, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
