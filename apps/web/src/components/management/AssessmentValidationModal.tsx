"use client";

import React from "react";
import type { AssessmentValidationResult } from "@/lib/api/assessment";

interface AssessmentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  validation: AssessmentValidationResult | null;
  isValidating: boolean;
  isPublishing: boolean;
}

export function AssessmentValidationModal({
  isOpen,
  onClose,
  onPublish,
  validation,
  isValidating,
  isPublishing,
}: AssessmentValidationModalProps) {
  if (!isOpen) return null;

  const errors = validation?.errors || [];
  const warnings = validation?.warnings || [];
  const canPublish = validation?.canPublish ?? false;

  const allRules = [
    { name: "1. Title Length (min 3 chars)", field: "title" },
    { name: "2. Detailed Description (min 10 chars)", field: "description" },
    { name: "3. Instructions Markdown", field: "instructions" },
    { name: "4. Tasks & Rubric Configuration", field: "tasks" },
    { name: "5. Passing Score Range (50-100)", field: "passingScore" },
    { name: "6. Realistic Duration (15-600 min)", field: "durationMinutes" },
    { name: "7. Skills Required (>= 1 tag)", field: "skillsRequired" },
    { name: "8. Deliverables Configuration", field: "deliverables" },
    { name: "9. Target Role Title", field: "roleTitle" },
    { name: "10. Complexity Score Range (1-100)", field: "complexityScore" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 rounded-full bg-brand-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-100">
              Pre-Publish Integrity Check (10-Point Engine)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="text-sm text-slate-400">Running 10-point domain integrity checks...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Banner */}
              <div
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  !canPublish
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : warnings.length > 0
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                <div>
                  <h3 className="font-semibold text-sm">
                    {!canPublish
                      ? "❌ Cannot Publish — Critical Validation Errors"
                      : warnings.length > 0
                        ? "⚠️ Ready with Warnings — Review optional improvements"
                        : "✅ Perfect — Enterprise Assessment Ready for Marketplace"}
                  </h3>
                  <p className="text-xs mt-1 opacity-80">
                    {!canPublish
                      ? `Found ${errors.length} error(s) that must be resolved before publishing.`
                      : "All mandatory CTO integrity constraints are met."}
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div>Errors: {errors.length}</div>
                  <div>Warnings: {warnings.length}</div>
                </div>
              </div>

              {/* Integrity Checklist */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allRules.map((rule) => {
                  const ruleError = errors.find((e) => e.field.startsWith(rule.field));
                  const ruleWarn = warnings.find((w) => w.field.startsWith(rule.field));

                  return (
                    <div
                      key={rule.field}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-800/40 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium text-slate-300">{rule.name}</span>
                      {ruleError ? (
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/30">
                          <span>✖ {ruleError.message}</span>
                        </span>
                      ) : ruleWarn ? (
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                          <span>▲ {ruleWarn.message}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                          <span>✔ Passed</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onPublish}
            disabled={!canPublish || isValidating || isPublishing}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all ${
              !canPublish || isValidating || isPublishing
                ? "bg-slate-700 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-brand-500/20"
            }`}
          >
            {isPublishing ? "Publishing..." : "Publish Assessment Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
