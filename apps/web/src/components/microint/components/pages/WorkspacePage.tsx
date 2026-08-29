"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
const safeConfetti = () => {
 if (typeof window !== "undefined" && (window as unknown as { confetti?: () => void }).confetti) {
 (window as unknown as { confetti: (opt?: object) => void }).confetti({
 particleCount: 100,
 spread: 70,
 origin: { y: 0.6 },
 });
 }
};
import {
 Code2,
 Clock,
 Upload,
 Send,
 FileCode,
 CheckCircle2,
 Play,
 Terminal,
 FileCheck,
 Sparkles,
 Copy,
 Check,
} from "lucide-react";

export const WorkspacePage: React.FC = () => {
 const { activeWorkspaceTrial, submitWorkspaceTask, showToast, setCurrentRoute, trials } =
 useApp();

 const trial = activeWorkspaceTrial || trials[0];

 // Hooks declared unconditionally at top level
 const [secondsLeft, setSecondsLeft] = useState(9930); // ~2h 45m 30s
 const [codeContent, setCodeContent] = useState(`/**
 * Candidate Workspace
 * Task: ${trial ? trial.title : "Fullstack Feature"}
 */

import React, { useState } from 'react';

export default function App() {
  return (
    <div className="p-6 bg-[#0A0A0A] text-white rounded-[32px] border border-white/10">
      <h2 className="text-xl font-serif tracking-tight">Hello, World!</h2>
      <p className="text-xs text-white/50 mt-1">Start building your solution here.</p>
    </div>
  );
}`);

 const [uploadedFiles, setUploadedFiles] = useState<string[]>([
 "app.tsx",
 "package.json",
 ]);
 const [isTestRunning, setIsTestRunning] = useState(false);
 const [testLog, setTestLog] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);

 useEffect(() => {
 const timer = setInterval(() => {
 setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
 }, 1000);
 return () => clearInterval(timer);
 }, []);

 if (!trial) {
 return (
 <div className="pb-12 text-[#222] max-w-[1200px] mx-auto w-full font-sans">
 <Breadcrumbs currentTitle="Workspace" />
 <div className="py-24 px-6 text-center rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50 max-w-lg mx-auto my-10">
 <div className="w-16 h-16 rounded-full bg-black/5 backdrop-blur-xl/5 text-[#222] flex items-center justify-center mx-auto mb-6">
 <Code2 className="w-6 h-6" />
 </div>
 <h2 className="text-2xl tracking-tight text-[#222] font-serif">
 No Active Trial
 </h2>
 <p className="text-sm text-black/50 max-w-sm mx-auto mt-2 leading-relaxed">
 Select an open trial from the Discover catalog or open a shortlisted workspace from My
 Applications.
 </p>
 <button
 onClick={() => setCurrentRoute("discover-trials")}
 className="mt-8 px-6 py-3 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
 >
 Discover Trials
 </button>
 </div>
 </div>
 );
 }

 const formatTime = (totalSec: number) => {
 const h = Math.floor(totalSec / 3600);
 const m = Math.floor((totalSec % 3600) / 60);
 const s = totalSec % 60;
 return `${h.toString().padStart(2, "0")}h : ${m.toString().padStart(2, "0")}m : ${s.toString().padStart(2, "0")}s`;
 };

 const handleRunTests = () => {
 setIsTestRunning(true);
 setTestLog("Initializing candidate test suite sandbox...");
 setTimeout(() => {
 setTestLog(
 `[PASS] static_syntax_check.ts\n[PASS] component_render_test.tsx (14ms)\n[PASS] subscription_upgrade_state.test.ts (28ms)\nAll 3 test suites passed! Ready for final submission.`,
 );
 setIsTestRunning(false);
 showToast("Tests Passed!", "100% test assertions satisfied.", "success");
 }, 1200);
 };

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (files && files.length > 0) {
 const names = Array.from(files).map((f: File) => f.name);
 setUploadedFiles((prev) => [...prev, ...names]);
 showToast("Files Attached", `Added ${names.length} file(s) to submission bundle.`, "info");
 }
 };

 const handleSubmitTrial = () => {
 safeConfetti();

 submitWorkspaceTask(trial.id, codeContent, uploadedFiles);
 setTimeout(() => setCurrentRoute("submissions"), 1200);
 };

 const handleCopy = () => {
 navigator.clipboard.writeText(codeContent);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <div className="pb-12 text-[#222] max-w-[1200px] mx-auto w-full font-sans">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
 <div>
 <div className="flex items-center gap-3 text-black/40 text-sm font-semibold mb-2">
 <span className="flex items-center gap-1.5">
 <Sparkles className="w-4 h-4" /> Active Workspace
 </span>
 </div>
 <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#222]">
 {trial.company}
 </h1>
 </div>

 {/* Timer Widget */}
 <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm px-6 py-4 rounded-full border border-white/50">
 <div className="text-right">
 <p className="text-[10px] text-black/40 uppercase font-bold tracking-widest">
 Submission Deadline
 </p>
 <p className="text-base font-black font-mono text-[#222]">
 {formatTime(secondsLeft)}
 </p>
 </div>
 <div className="w-10 h-10 rounded-full bg-black/5 backdrop-blur-xl/5 flex items-center justify-center">
 <Clock className="w-4 h-4 text-[#222]" />
 </div>
 </div>
 </div>

 {/* Main Workspace Split Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column: Instructions & Files Upload (5 Cols) */}
 <div className="lg:col-span-5 space-y-6">
 {/* Instructions Card */}
 <div className="p-8 rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 shadow-sm space-y-6">
 <h3 className="font-serif text-2xl tracking-tight text-[#222] pb-4 border-b border-white/50 flex items-center gap-3">
 <FileCode className="w-5 h-5 text-[#222]" />
 Trial Scope
 </h3>

 <p className="text-sm text-black/60 leading-relaxed font-medium">
 {trial.description}
 </p>

 <div>
 <h4 className="font-bold text-xs uppercase tracking-widest text-black/40 mb-4">
 Required Deliverables
 </h4>
 <ul className="space-y-3 text-sm">
 {trial.deliverables?.map((d, i) => (
 <li
 key={i}
 className="flex items-start gap-3 text-black/70 font-medium"
 >
 <CheckCircle2 className="w-5 h-5 text-[#222] flex-shrink-0" />
 <span>{d}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Drag & Drop File Upload Zone */}
 <div className="p-8 rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 shadow-sm space-y-6">
 <h3 className="font-serif tracking-tight text-xl flex items-center justify-between text-[#222]">
 <span className="flex items-center gap-3">
 <Upload className="w-5 h-5" />
 Upload Files
 </span>
 <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-black/5 backdrop-blur-xl/5 text-black/40 tracking-widest uppercase">
 {uploadedFiles.length} Attached
 </span>
 </h3>

 <label className="border-2 border-dashed border-white/50 rounded-[24px] p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 :bg-white/60 backdrop-blur-xl/5 transition-colors group">
 <div className="w-12 h-12 rounded-full bg-black/5 backdrop-blur-xl/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Upload className="w-5 h-5 text-[#222]" />
 </div>
 <p className="text-sm font-bold text-[#222]">
 Click or drag files here
 </p>
 <p className="text-xs text-black/40 mt-1 font-medium">
 .zip, .ts, .tsx, .json (Max 25MB)
 </p>
 <input type="file" multiple onChange={handleFileUpload} className="hidden" />
 </label>

 {/* Uploaded Files List */}
 {uploadedFiles.length > 0 && (
 <div className="space-y-2 pt-2">
 {uploadedFiles.map((f, idx) => (
 <div
 key={idx}
 className="flex items-center justify-between p-4 rounded-3xl bg-black/5 backdrop-blur-xl/5 text-sm font-medium"
 >
 <span className="flex items-center gap-3">
 <FileCheck className="w-4 h-4 text-[#222]" />
 <span className="font-mono text-[#222] tracking-tight">
 {f}
 </span>
 </span>
 <span className="text-[10px] text-black/40 uppercase font-bold tracking-widest">
 Ready
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Right Column: Code Editor & Test Runner (7 Cols) */}
 <div className="lg:col-span-7 space-y-6">
 {/* Code Editor Mockup */}
 <div className="rounded-[40px] bg-[#0A0A0A] border border-white/10 shadow-xl overflow-hidden flex flex-col">
 {/* Editor Header Bar */}
 <div className="px-6 py-4 bg-[#141414] flex items-center justify-between text-xs text-white/60">
 <div className="flex items-center gap-3 font-mono font-medium tracking-tight text-white">
 <Code2 className="w-4 h-4 text-white" />
 <span>subscription_engine.tsx</span>
 </div>

 <div className="flex items-center gap-3">
 <button
 onClick={handleCopy}
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60 backdrop-blur-xl/10 text-white/60 hover:text-white transition-colors cursor-pointer"
 title="Copy code"
 >
 {copied ? (
 <Check className="w-3.5 h-3.5 text-white" />
 ) : (
 <Copy className="w-3.5 h-3.5" />
 )}
 </button>
 <button
 onClick={handleRunTests}
 disabled={isTestRunning}
 className="px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-xl hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
 >
 <Play className="w-3 h-3 fill-black" />
 <span>{isTestRunning ? "Running Tests..." : "Run Suite"}</span>
 </button>
 </div>
 </div>

 {/* Code Input Area */}
 <textarea
 value={codeContent}
 onChange={(e) => setCodeContent(e.target.value)}
 rows={16}
 className="w-full p-6 bg-[#0A0A0A] text-white font-mono text-sm focus:outline-none resize-none leading-relaxed"
 />

 {/* Test Log Output */}
 {testLog && (
 <div className="p-6 bg-[#141414] border-t border-white/10 font-mono text-[11px] text-white/70">
 <div className="flex items-center gap-2 text-white font-bold mb-2 tracking-widest uppercase">
 <Terminal className="w-3.5 h-3.5" />
 <span>Output Console</span>
 </div>
 <pre className="whitespace-pre-wrap leading-relaxed">{testLog}</pre>
 </div>
 )}
 </div>

 {/* Final Submit Trigger Card */}
 <div className="p-8 rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
 <div>
 <h4 className="font-serif tracking-tight text-xl text-[#222]">
 Ready for Evaluation?
 </h4>
 <p className="text-xs text-black/50 mt-1 font-medium">
 Submitting will run static checks and notify reviewers.
 </p>
 </div>

 <button
 onClick={handleSubmitTrial}
 className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
 >
 <Send className="w-4 h-4" />
 <span>Submit Deliverable</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};
