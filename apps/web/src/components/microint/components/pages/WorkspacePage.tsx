'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
const safeConfetti = () => {
  if (typeof window !== 'undefined' && (window as unknown as { confetti?: () => void }).confetti) {
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
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { activeWorkspaceTrial, submitWorkspaceTask, showToast, setCurrentRoute, trials } = useApp();

  const trial = activeWorkspaceTrial || trials[0];

  if (!trial) {
    return (
      <div>
        <Breadcrumbs currentTitle="Workspace" />
        <div className="py-20 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">No Active Workspace Trial</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Select an open trial from the Discover Trials catalog or open an shortlisted workspace from My Applications to start coding.
          </p>
          <button
            onClick={() => setCurrentRoute('discover-trials')}
            className="mt-6 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            Discover Trials Now
          </button>
        </div>
      </div>
    );
  }

  // Timer Simulation
  const [secondsLeft, setSecondsLeft] = useState(9930); // ~2h 45m 30s
  const [codeContent, setCodeContent] = useState(`/**
 * MicroIntern Skill Trial Deliverable
 * Company: ${trial.company}
 * Task: ${trial.title}
 */

import React, { useState } from 'react';

export default function SubscriptionBillingEngine() {
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [apiUsage, setApiUsage] = useState(1420);

  const handleUpgrade = (newPlan: 'pro' | 'enterprise') => {
    setPlan(newPlan);
    console.log(\`Upgraded candidate account to \${newPlan}\`);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800">
      <h2 className="text-xl font-bold">Billing Dashboard</h2>
      <p className="text-xs text-slate-400 mt-1">Current Active Tier: <span className="font-bold text-purple-400">{plan.toUpperCase()}</span></p>
      
      <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
        <p className="text-xs text-slate-300">API Calls Consumed This Month</p>
        <p className="text-2xl font-black text-emerald-400">{apiUsage} / 10,000</p>
      </div>
    </div>
  );
}`);

  const [uploadedFiles, setUploadedFiles] = useState<string[]>(['subscription_engine.tsx', 'package.json']);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  const handleRunTests = () => {
    setIsTestRunning(true);
    setTestLog('Initializing candidate test suite sandbox...');
    setTimeout(() => {
      setTestLog(
        `[PASS] static_syntax_check.ts\n[PASS] component_render_test.tsx (14ms)\n[PASS] subscription_upgrade_state.test.ts (28ms)\nAll 3 test suites passed! Ready for final submission.`
      );
      setIsTestRunning(false);
      showToast('Tests Passed!', '100% test assertions satisfied.', 'success');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((f: File) => f.name);
      setUploadedFiles((prev) => [...prev, ...names]);
      showToast('Files Attached', `Added ${names.length} file(s) to submission bundle.`, 'info');
    }
  };

  const handleSubmitTrial = () => {
    safeConfetti();

    submitWorkspaceTask(trial.id, codeContent, uploadedFiles);
    setTimeout(() => setCurrentRoute('submissions'), 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Breadcrumbs currentTitle="Workspace" />

      {/* Top Workspace Bar: Trial Title & Countdown Timer */}
      <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {trial.company}
            </span>
            <span className="text-xs text-slate-400 font-mono">• Active Trial Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">{trial.title}</h1>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-4 bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Submission Deadline</p>
            <p className="text-sm font-black font-mono text-amber-400">{formatTime(secondsLeft)}</p>
          </div>
          <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Instructions & Files Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instructions Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Trial Instructions & Scope</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {trial.description}
            </p>

            <div>
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Required Deliverables</h4>
              <ul className="space-y-2 text-xs">
                {trial.deliverables?.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Drag & Drop File Upload Zone */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Upload Deliverable Files</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">{uploadedFiles.length} attached</span>
            </h3>

            <label className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click or drag files here to attach
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Accepts .zip, .ts, .tsx, .json, .png (Max 25MB)</p>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono text-slate-700 dark:text-slate-300">{f}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Test Runner (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Code Editor Mockup */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Editor Header Bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>subscription_engine.tsx</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleRunTests}
                  disabled={isTestRunning}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isTestRunning ? 'Running Tests...' : 'Run Test Suite'}</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              rows={14}
              className="w-full p-4 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            />

            {/* Test Log Output */}
            {testLog && (
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Output Console</span>
                </div>
                <pre className="whitespace-pre-wrap text-emerald-400">{testLog}</pre>
              </div>
            )}
          </div>

          {/* Final Submit Trigger Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ready for Evaluation?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submitting will run static checks, notify reviewers, and update your Trust Score.
              </p>
            </div>

            <button
              onClick={handleSubmitTrial}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Trial Deliverable</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
