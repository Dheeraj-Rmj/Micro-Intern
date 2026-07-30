"use client";

import React, { useState, useEffect } from "react";
import { Award, Plus, Trash2, CheckCircle2, AlertTriangle, BarChart3, Sliders } from "lucide-react";

export interface CompetencyItem {
  id?: string;
  name: string;
  category: string;
  weight: number;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface CompetencyMatrixBuilderProps {
  assessmentId: string;
  initialCompetencies?: CompetencyItem[];
  onUpdate?: (competencies: CompetencyItem[], totalWeight: number) => void;
}

const DEFAULT_CATEGORIES = ["Core", "Architecture", "Engineering", "Collaboration", "Leadership"];

const PRESET_COMPETENCIES: CompetencyItem[] = [
  { name: "Problem Solving", category: "Core", weight: 30, importance: "HIGH" },
  { name: "System Design", category: "Architecture", weight: 25, importance: "CRITICAL" },
  { name: "Code Quality", category: "Engineering", weight: 25, importance: "HIGH" },
  { name: "Communication", category: "Collaboration", weight: 20, importance: "MEDIUM" },
];

export function CompetencyMatrixBuilder({
  assessmentId,
  initialCompetencies,
  onUpdate,
}: CompetencyMatrixBuilderProps) {
  const [competencies, setCompetencies] = useState<CompetencyItem[]>(
    initialCompetencies && initialCompetencies.length > 0
      ? initialCompetencies
      : PRESET_COMPETENCIES,
  );
  const [newCompetencyName, setNewCompetencyName] = useState("");
  const [newCategory, setNewCategory] = useState("Core");
  const [newWeight, setNewWeight] = useState<number>(10);
  const [newImportance, setNewImportance] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">(
    "MEDIUM",
  );

  const totalWeight = competencies.reduce((acc, c) => acc + (c.weight || 0), 0);
  const isValidWeight = Math.abs(totalWeight - 100) < 0.5 || totalWeight === 0;

  useEffect(() => {
    onUpdate?.(competencies, totalWeight);
  }, [competencies, totalWeight, onUpdate]);

  const handleAddCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetencyName.trim()) return;

    const updated = [
      ...competencies,
      {
        name: newCompetencyName.trim(),
        category: newCategory,
        weight: Number(newWeight),
        importance: newImportance,
      },
    ];
    setCompetencies(updated);
    setNewCompetencyName("");
    setNewWeight(10);
  };

  const handleRemove = (index: number) => {
    setCompetencies(competencies.filter((_, idx) => idx !== index));
  };

  const handleWeightChange = (index: number, weight: number) => {
    const updated = [...competencies];
    updated[index]!.weight = weight;
    setCompetencies(updated);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-slate-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">Competency Matrix</h3>
            <p className="text-xs text-slate-400">
              Configure percentage weights and signal importance across evaluated competencies
            </p>
          </div>
        </div>

        {/* Total Weight Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isValidWeight
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          {isValidWeight ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>Total Weight: {totalWeight.toFixed(1)}% / 100%</span>
        </div>
      </div>

      {/* Competency Cards Grid */}
      <div className="space-y-3 mb-6">
        {competencies.map((comp, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/40 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{comp.name}</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-700 text-slate-300">
                    {comp.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      comp.importance === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : comp.importance === "HIGH"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-700/60 text-slate-300"
                    }`}
                  >
                    {comp.importance} importance
                  </span>
                </div>
              </div>
            </div>

            {/* Slider and Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={comp.weight}
                  onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                  className="w-28 sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="w-12 text-right font-mono font-bold text-sm text-indigo-400">
                  {comp.weight}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove competency"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new competency form */}
      <form
        onSubmit={handleAddCompetency}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800"
      >
        <div className="sm:col-span-4">
          <input
            type="text"
            placeholder="Competency Name (e.g. System Design)"
            value={newCompetencyName}
            onChange={(e) => setNewCompetencyName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={newImportance}
            onChange={(e) => setNewImportance(e.target.value as any)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="LOW">Low Importance</option>
            <option value="MEDIUM">Medium Importance</option>
            <option value="HIGH">High Importance</option>
            <option value="CRITICAL">Critical Signal</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </div>
  );
}
