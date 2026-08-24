"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Award,
  Monitor,
  Bookmark,
  CheckCircle2,
  History,
  Command,
  ArrowRight,
  X,
} from "lucide-react";

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "AI" | "STUDIO" | "PUBLISHING" | "AUDIT";
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand?: (commandId: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // toggles or triggers search
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    {
      id: "AI_GENERATE_ASSESSMENT",
      label: "Generate Assessment with AI",
      description: "Use AI to generate competency tasks, rubrics & learning outcomes",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      category: "AI",
      onSelect: () => onSelectCommand?.("AI_GENERATE_ASSESSMENT"),
    },
    {
      id: "VIEW_COMPETENCY_MATRIX",
      label: "View Competency Matrix",
      description: "Configure percentage weights and signal importance",
      icon: <Award className="w-4 h-4 text-indigo-400" />,
      category: "STUDIO",
      onSelect: () => onSelectCommand?.("VIEW_COMPETENCY_MATRIX"),
    },
    {
      id: "OPEN_MULTI_DEVICE_PREVIEW",
      label: "Open Multi-Device Preview",
      description: "Preview assessment on Desktop, Tablet, Mobile, and Reviewer Rubric modes",
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      category: "STUDIO",
      onSelect: () => onSelectCommand?.("OPEN_MULTI_DEVICE_PREVIEW"),
    },
    {
      id: "SAVE_AS_TEMPLATE",
      label: "Save as Reusable Template",
      description: "Create an Organization or Global reusable assessment template",
      icon: <Bookmark className="w-4 h-4 text-amber-400" />,
      category: "PUBLISHING",
      onSelect: () => onSelectCommand?.("SAVE_AS_TEMPLATE"),
    },
    {
      id: "PUBLISH_ASSESSMENT",
      label: "Publish Assessment Assessment",
      description: "Run pre-publish validation and publish assessment to marketplace",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      category: "PUBLISHING",
      onSelect: () => onSelectCommand?.("PUBLISH_ASSESSMENT"),
    },
    {
      id: "VIEW_ACTIVITY_TIMELINE",
      label: "View Activity Timeline",
      description: "Audit complete history of edits, AI generations, and approvals",
      icon: <History className="w-4 h-4 text-pink-400" />,
      category: "AUDIT",
      onSelect: () => onSelectCommand?.("VIEW_ACTIVITY_TIMELINE"),
    },
  ];

  const filteredCommands = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search actions... (e.g. Generate Assessment with AI)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Command List */}
        <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredCommands.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5" />
            <span>Cmd+K to open Command Palette</span>
          </div>
          <span>Enterprise Assessment Studio OS v1.0</span>
        </div>
      </div>
    </div>
  );
}
