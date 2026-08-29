"use client";

import React, { useState, useEffect } from "react";
import {
  useAssessmentEditorStore,
  type AssessmentSectionKey,
} from "@/stores/assessment-editor.store";
import {
  assessmentApi,
  type AssessmentDto,
  type AssessmentTaskDto,
  type AssessmentDeliverableDto,
} from "@/lib/api/assessment";
import { AssessmentValidationModal } from "./AssessmentValidationModal";
import { CompetencyMatrixBuilder } from "./CompetencyMatrixBuilder";
import { LearningOutcomesEditor } from "./LearningOutcomesEditor";
import { MultiDevicePreviewModal } from "./MultiDevicePreviewModal";
import { CommandPalette } from "./CommandPalette";

interface AssessmentStudioProps {
  initialAssessment: AssessmentDto;
}

export function AssessmentStudio({ initialAssessment }: AssessmentStudioProps) {
  const {
    assessment,
    setAssessment,
    activeSection,
    setActiveSection,
    updateAssessmentField,
    addTask,
    updateTask,
    removeTask,
    addDeliverable,
    removeDeliverable,
    isDirty,
    setDirty,
    validationResult,
    setValidationResult,
  } = useAssessmentEditorStore();

  const [isValidationModalOpen, setValidationModalOpen] = useState(false);
  const [isValidating, setValidating] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [isAiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [isVersionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [aiAction, setAiAction] = useState("GENERATE_RUBRIC");
  const [aiInputPrompt, setAiInputPrompt] = useState("");
  const [isAiRunning, setAiRunning] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    setAssessment(initialAssessment);
  }, [initialAssessment, setAssessment]);

  const currentAssessment = assessment || initialAssessment;

  // Auto-save debounce effect
  useEffect(() => {
    if (!isDirty || !currentAssessment.id) return;
    const timer = setTimeout(async () => {
      try {
        await assessmentApi.updateAssessment(currentAssessment.id, currentAssessment);
        setDirty(false);
        setNotification("Auto-saved changes to cloud");
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isDirty, currentAssessment, setDirty]);

  const handleRunValidation = async () => {
    setValidationModalOpen(true);
    setValidating(true);
    try {
      const res = await assessmentApi.validateAssessment(currentAssessment.id);
      setValidationResult(res);
    } catch (err) {
      console.error("Validation check failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await assessmentApi.publishAssessment(currentAssessment.id);
      setAssessment(updated);
      setValidationModalOpen(false);
      setNotification("🎉 Assessment published successfully!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to publish assessment");
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenVersions = async () => {
    setVersionDrawerOpen(true);
    try {
      const list = await assessmentApi.listVersions(currentAssessment.id);
      setVersions(list);
    } catch (err) {
      console.error("Failed to load version history:", err);
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    try {
      const restored = await assessmentApi.restoreVersion(currentAssessment.id, versionNumber);
      setAssessment(restored);
      setVersionDrawerOpen(false);
      setNotification(`Restored version #${versionNumber}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      alert("Failed to restore version");
    }
  };

  const handleRunAIAction = async () => {
    setAiRunning(true);
    try {
      const res = await assessmentApi.triggerAIJob(currentAssessment.id, aiAction, {
        title: currentAssessment.title,
        roleTitle: currentAssessment.roleTitle,
        instructions: currentAssessment.instructions,
        customPrompt: aiInputPrompt,
      });
      setNotification(`🤖 AI Job started (${res.action}). Results will appear shortly.`);
      setAiDrawerOpen(false);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert("Failed to queue AI job");
    } finally {
      setAiRunning(false);
    }
  };

  const sections: Array<{ key: AssessmentSectionKey; label: string; icon: string }> = [
    { key: "OVERVIEW", label: "Overview", icon: "📋" },
    { key: "COMPETENCY", label: "Competency Matrix", icon: "🎯" },
    { key: "LEARNING_OUTCOMES", label: "Learning Outcomes", icon: "📚" },
    { key: "TECHNICAL", label: "Technical Tasks", icon: "💻" },
    { key: "COMMUNICATION", label: "Communication Tasks", icon: "💬" },
    { key: "RESEARCH", label: "Research Tasks", icon: "🔍" },
    { key: "BONUS", label: "Optional Bonus", icon: "⭐" },
    { key: "SUBMISSION", label: "Submission & Deliverables", icon: "📦" },
  ];

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-100 antialiased selection:bg-brand-500/30">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 backdrop-blur">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <input
              type="text"
              value={currentAssessment.title}
              onChange={(e) => updateAssessmentField("title", e.target.value)}
              className="bg-transparent font-semibold text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 rounded px-1.5 py-0.5 -ml-1.5 transition-all"
              placeholder="Assessment Title..."
            />
            <span className="text-xs text-slate-500 font-mono">
              slug: {currentAssessment.slug} • {currentAssessment.status}
            </span>
          </div>

          {isDirty ? (
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved Changes</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Saved to Cloud</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {notification && (
            <span className="text-xs font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
              {notification}
            </span>
          )}

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            title="Press Cmd+K / Ctrl+K"
          >
            <span>⌘</span>
            <span>Cmd+K</span>
          </button>

          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <span>📱</span>
            <span>Preview</span>
          </button>

          <button
            onClick={handleOpenVersions}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span>📜</span>
            <span>Version History</span>
          </button>

          <button
            onClick={() => setAiDrawerOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300 hover:bg-brand-500/20 transition-all shadow-sm"
          >
            <span>✨</span>
            <span>AI Assistant</span>
          </button>

          <button
            onClick={handleRunValidation}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span>🛡️</span>
            <span>Pre-Publish Check</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg hover:from-brand-500 hover:to-indigo-500 transition-all"
          >
            {isPublishing ? "Publishing..." : "Publish Assessment"}
          </button>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Section Navigation Sidebar */}
        <nav className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
          <div className="px-2 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Assessment Sections
          </div>
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeSection === section.key
                  ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        {/* Editor Content Area */}
        <main className="flex-1 overflow-y-auto p-8 max-w-5xl">
          {activeSection === "OVERVIEW" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Assessment Overview & Parameters</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Target Role Title
                  </label>
                  <input
                    type="text"
                    value={currentAssessment.roleTitle || ""}
                    onChange={(e) => updateAssessmentField("roleTitle", e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                    placeholder="e.g. Senior Backend TypeScript Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={currentAssessment.level || "SENIOR"}
                    onChange={(e) => updateAssessmentField("level", e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="JUNIOR">Junior (0-2 years)</option>
                    <option value="MID">Mid-Level (2-5 years)</option>
                    <option value="SENIOR">Senior (5+ years)</option>
                    <option value="STAFF">Staff / Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={currentAssessment.durationMinutes}
                    onChange={(e) =>
                      updateAssessmentField("durationMinutes", Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Passing Score (50-100)
                  </label>
                  <input
                    type="number"
                    value={currentAssessment.passingScore}
                    onChange={(e) => updateAssessmentField("passingScore", Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    AI Difficulty Level
                  </label>
                  <select
                    value={currentAssessment.difficulty || "Medium"}
                    onChange={(e) => updateAssessmentField("difficulty", e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentAssessment.isProctored || false}
                      onChange={(e) => updateAssessmentField("isProctored", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
                  </label>
                  <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="text-brand-400">🔒</span>
                    Secure Exam Proctoring (Fullscreen, Camera, Mic)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={currentAssessment.description}
                  onChange={(e) => updateAssessmentField("description", e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none font-mono text-xs"
                  placeholder="Comprehensive assessment description for candidates..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Instructions (Markdown Supported)
                </label>
                <textarea
                  rows={8}
                  value={currentAssessment.instructions}
                  onChange={(e) => updateAssessmentField("instructions", e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none font-mono text-xs"
                  placeholder="# Complete the REST API endpoint..."
                />
              </div>
            </div>
          )}

          {activeSection === "COMPETENCY" && (
            <div className="space-y-6">
              <CompetencyMatrixBuilder
                assessmentId={currentAssessment.id || "new-assessment"}
                onUpdate={(comps, totalWeight) => {
                  setDirty(true);
                }}
              />
            </div>
          )}

          {activeSection === "LEARNING_OUTCOMES" && (
            <div className="space-y-6">
              <LearningOutcomesEditor
                assessmentId={currentAssessment.id || "new-assessment"}
                roleTitle={currentAssessment.title || "Senior Software Engineer"}
                onUpdate={(outcomes) => {
                  setDirty(true);
                }}
              />
            </div>
          )}

          {["TECHNICAL", "COMMUNICATION", "RESEARCH", "BONUS"].includes(activeSection) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">
                  {activeSection === "TECHNICAL"
                    ? "Technical Assessment Tasks"
                    : activeSection === "COMMUNICATION"
                      ? "Communication & Collaboration Tasks"
                      : activeSection === "RESEARCH"
                        ? "Research & Architecture Tasks"
                        : "Optional Bonus Tasks"}
                </h2>
                <button
                  onClick={() =>
                    addTask({
                      title: "New Assessment Task",
                      description: "Task instructions and evaluation guidelines...",
                      taskType: activeSection === "TECHNICAL" ? "CODING" : "WRITING",
                      maxPoints: 50,
                      sortOrder: (currentAssessment.tasks?.length || 0) + 1,
                    })
                  }
                  className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md"
                >
                  + Add New Task
                </button>
              </div>

              <div className="space-y-4">
                {currentAssessment.tasks && currentAssessment.tasks.length > 0 ? (
                  currentAssessment.tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 font-mono text-xs text-slate-300">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTask(idx, { title: e.target.value })}
                            className="bg-transparent font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 rounded px-2 py-1 -ml-2"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-slate-400">
                            {task.maxPoints} pts
                          </span>
                          <button
                            onClick={() => removeTask(idx)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={task.description}
                        onChange={(e) => updateTask(idx, { description: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300 focus:border-brand-500 focus:outline-none"
                        placeholder="Detailed instructions for this task..."
                      />

                      {/* Rubric Criteria Section */}
                      <div className="border-t border-slate-800/80 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Evaluation Rubric Criteria
                          </span>
                          <button
                            onClick={() => {
                              const criteria = [
                                ...(task.criteria || []),
                                {
                                  title: "Code Cleanliness",
                                  description: "Proper modular structure and naming",
                                  maxPoints: 10,
                                },
                              ];
                              updateTask(idx, { criteria });
                            }}
                            className="text-xs font-medium text-brand-400 hover:text-brand-300"
                          >
                            + Add Rubric Item
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(task.criteria || []).map((crit, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-center justify-between rounded bg-slate-950/40 px-3 py-1.5 text-xs text-slate-300 border border-slate-800/60"
                            >
                              <span className="font-medium">{crit.title}</span>
                              <span className="font-mono text-slate-400">{crit.maxPoints} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-400">
                    No tasks added to this section yet. Click &quot;+ Add New Task&quot; to begin.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "SUBMISSION" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">
                  Submission & Required Deliverables
                </h2>
                <button
                  onClick={() =>
                    addDeliverable({
                      title: "GitHub Repository URL",
                      deliverableType: "GITHUB_REPO",
                      isRequired: true,
                      description: "Provide the public or shared repository URL.",
                    })
                  }
                  className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md"
                >
                  + Add Deliverable
                </button>
              </div>

              <div className="space-y-3">
                {(currentAssessment.deliverables || []).map((deliv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{deliv.title}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {deliv.deliverableType}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeliverable(idx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── 10-Point Pre-Publish Validation Modal ────────────────────────────── */}
      <AssessmentValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        onPublish={handlePublish}
        validation={validationResult}
        isValidating={isValidating}
        isPublishing={isPublishing}
      />

      {/* ── Slide-Over AI Assistant Drawer ───────────────────────────────────── */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-96 h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-semibold text-base text-slate-100 flex items-center space-x-2">
                  <span>✨</span>
                  <span>MicroIntern AI Assistant</span>
                </h3>
                <button
                  onClick={() => setAiDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Select AI Capability
                </label>
                <select
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                >
                  <option value="GENERATE_RUBRIC">Generate Evaluation Rubric</option>
                  <option value="GENERATE_ASSESSMENT">Generate Full Enterprise Assessment</option>
                  <option value="IMPROVE_ASSESSMENT">Improve & Polish Description</option>
                  <option value="REWRITE_INSTRUCTIONS">Rewrite Instructions (Linear style)</option>
                  <option value="SUGGEST_SKILLS">Suggest Technical Skill Tags</option>
                  <option value="SUGGEST_DELIVERABLES">Suggest Required Deliverables</option>
                  <option value="ESTIMATE_DIFFICULTY">Estimate Difficulty & Complexity</option>
                  <option value="ESTIMATE_DURATION">Estimate Realistic Duration</option>
                  <option value="SUGGEST_LEARNING_OUTCOMES">Suggest Learning Outcomes</option>
                  <option value="GENERATE_INTERVIEW_QUESTIONS">
                    Generate Follow-Up Interview Qs
                  </option>
                  <option value="GENERATE_EVALUATION_NOTES">
                    Generate Recruiter Evaluation Notes
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Custom Prompt / Context
                </label>
                <textarea
                  rows={4}
                  value={aiInputPrompt}
                  onChange={(e) => setAiInputPrompt(e.target.value)}
                  placeholder="Optional context for AI generator..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleRunAIAction}
              disabled={isAiRunning}
              className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-brand-500 hover:to-indigo-500 transition-all"
            >
              {isAiRunning ? "Running AI Pipeline..." : "Run AI Assistant"}
            </button>
          </div>
        </div>
      )}

      {/* ── Slide-Over Version Timeline Drawer ───────────────────────────────── */}
      {isVersionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-96 h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-semibold text-base text-slate-100 flex items-center space-x-2">
                  <span>📜</span>
                  <span>Version History & Snapshots</span>
                </h3>
                <button
                  onClick={() => setVersionDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {versions.length > 0 ? (
                  versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>Version #{ver.versionNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400">{ver.changeSummary || "No summary provided"}</p>
                      <button
                        onClick={() => handleRestoreVersion(ver.versionNumber)}
                        className="text-brand-400 hover:text-brand-300 font-medium"
                      >
                        Restore this snapshot →
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No version snapshots recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Multi-Device & Reviewer Rubric Preview Modal ────────────────────── */}
      <MultiDevicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        assessment={{
          id: currentAssessment.id || "new-assessment",
          title: currentAssessment.title || "Untitled Assessment",
          description: currentAssessment.description || "Enterprise Assessment Assessment",
          durationMinutes: currentAssessment.durationMinutes || 180,
          tasks: currentAssessment.tasks || [],
        }}
      />

      {/* ── Keyboard-First Enterprise Command Palette (Cmd+K / Ctrl+K) ────── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectCommand={(cmdId) => {
          if (cmdId === "AI_GENERATE_ASSESSMENT") setAiDrawerOpen(true);
          else if (cmdId === "VIEW_COMPETENCY_MATRIX") setActiveSection("COMPETENCY");
          else if (cmdId === "OPEN_MULTI_DEVICE_PREVIEW") setPreviewModalOpen(true);
          else if (cmdId === "PUBLISH_ASSESSMENT") handleRunValidation();
          else if (cmdId === "VIEW_ACTIVITY_TIMELINE") handleOpenVersions();
        }}
      />
    </div>
  );
}
