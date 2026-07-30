"use client";

import React, { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  CheckSquare,
  X,
  ExternalLink,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react";

export type PreviewDeviceMode = "DESKTOP" | "TABLET" | "MOBILE" | "REVIEWER";

interface MultiDevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: string;
    title: string;
    description: string;
    durationMinutes?: number;
    tasks?: Array<{
      title: string;
      description: string;
      maxPoints?: number;
    }>;
    learningOutcomes?: string[];
  };
}

export function MultiDevicePreviewModal({
  isOpen,
  onClose,
  assessment,
}: MultiDevicePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<PreviewDeviceMode>("DESKTOP");

  if (!isOpen) return null;

  const getWidthClass = () => {
    switch (deviceMode) {
      case "MOBILE":
        return "max-w-[375px]";
      case "TABLET":
        return "max-w-[768px]";
      case "REVIEWER":
      case "DESKTOP":
      default:
        return "max-w-[1100px]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              Multi-Device Assessment Preview
            </h3>
          </div>

          {/* Device Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700">
            <button
              type="button"
              onClick={() => setDeviceMode("DESKTOP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === "DESKTOP"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (1440px)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("TABLET")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === "TABLET"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (768px)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("MOBILE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === "MOBILE"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("REVIEWER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === "REVIEWER"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Reviewer Rubric Mode</span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Viewport Canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/50">
          <div
            className={`w-full ${getWidthClass()} transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {deviceMode === "REVIEWER" ? (
              /* Reviewer Rubric Scoring Viewport */
              <div className="p-8 text-slate-100">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                      Reviewer Rubric Evaluation
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">{assessment.title}</h2>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                    Score Weight: 100%
                  </div>
                </div>

                <div className="space-y-4">
                  {(assessment.tasks || []).map((t, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-white">
                          Task {idx + 1}: {t.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">
                          Max: {t.maxPoints || 100} pts
                        </span>
                        <input
                          type="number"
                          placeholder="Score"
                          disabled
                          className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-sm text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Candidate Viewport (Desktop / Tablet / Mobile) */
              <div className="p-8 text-slate-100">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Enterprise Competency Assessment</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {assessment.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{assessment.durationMinutes || 180} mins</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed mb-8">
                  {assessment.description}
                </div>

                <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 mb-8">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>Learning Outcomes & Core Competencies</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                    {(
                      assessment.learningOutcomes || [
                        "RESTful API Design & HTTP Status Code conventions",
                        "Clean Architecture layer separation",
                        "Database Schema Modeling & Indexing",
                      ]
                    ).map((lo, i) => (
                      <li key={i}>{lo}</li>
                    ))}
                  </ul>
                </div>

                <h4 className="font-bold text-white mb-4">Assessment Assessment Tasks</h4>
                <div className="space-y-3">
                  {(assessment.tasks || []).map((t, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">
                          Task {idx + 1}: {t.title}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {t.maxPoints || 100} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
