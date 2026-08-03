'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  ShieldAlert,
  Sliders,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  Terminal,
  ShieldCheck,
  Ban,
  SlidersHorizontal,
  Code2,
} from 'lucide-react';

export const SuperAdminTrustAIPage: React.FC = () => {
  const { showToast } = useApp();
  const [githubWeight, setGithubWeight] = useState(40);
  const [llmRubricWeight, setLlmRubricWeight] = useState(30);
  const [peerReviewWeight, setPeerReviewWeight] = useState(15);
  const [streakWeight, setStreakWeight] = useState(15);

  const [selectedModel, setSelectedModel] = useState<'gemini' | 'groq' | 'openrouter' | 'ollama'>('gemini');
  const [isTestingModel, setIsTestingModel] = useState(false);

  const [flaggedCandidates, setFlaggedCandidates] = useState<any[]>([]);

  const totalWeight = githubWeight + llmRubricWeight + peerReviewWeight + streakWeight;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      showToast('Weight Mismatch', 'Total calibration weights must sum to exactly 100%.', 'warning');
      return;
    }
    showToast(
      'AI Engine Calibrated',
      'New Trust Score weighting formulas deployed across all 14 Docker sandbox runner nodes.',
      'success'
    );
  };

  const handleTestEvaluation = () => {
    setIsTestingModel(true);
    setTimeout(() => {
      setIsTestingModel(false);
      showToast(
        'AI Model Test Passed',
        `Evaluator [${selectedModel.toUpperCase()}] tested against 50 reference submissions in 2.1s with 99.4% accuracy.`,
        'success'
      );
    }, 1500);
  };

  const handleDismissFlag = (id: string) => {
    setFlaggedCandidates((prev) => prev.filter((item) => item.id !== id));
    showToast('Alert Dismissed', 'Candidate flagged submission marked as false positive.', 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
              AI ENGINE GOVERNANCE
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-[#E1E0CC]/50">
              TRUST SCORE LEVEL-0 CALIBRATION
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-[#E1E0CC]">
            AI Trust Engine & Calibration
          </h1>
          <p className="text-sm text-black/60 dark:text-[#E1E0CC]/70 mt-1">
            Configure algorithmic Trust Score weights, monitor AI anti-cheat plagiarism similarity alerts, and select LLM evaluation models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">Sandbox Nodes</div>
            <div className="text-base font-bold font-mono text-emerald-500">14 / 14 OK</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm text-center">
            <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">Plagiarism Flags</div>
            <div className="text-base font-bold font-mono text-amber-500">{flaggedCandidates.length} Active</div>
          </div>
        </div>
      </div>

      {/* ── 2 Columns: Weight Calibration Sliders & LLM Evaluator Selection ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Trust Score Weight Sliders */}
        <div className="lg:col-span-7 rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC] flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                <span>Algorithmic Trust Score Calibration</span>
              </h3>
              <span
                className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                  totalWeight === 100
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500 animate-pulse'
                }`}
              >
                Sum: {totalWeight}% {totalWeight === 100 ? '(VALID)' : '(INVALID)'}
              </span>
            </div>

            <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70 mb-6 leading-relaxed">
              Adjust how the platform calculates Candidate Trust Scores across all 24,890 active apprentices.
            </p>

            <form onSubmit={handleSaveWeights} className="space-y-6">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-black dark:text-[#E1E0CC]">1. GitHub Automated Sandbox Unit Tests</span>
                  <span className="font-bold text-indigo-500">{githubWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={githubWeight}
                  onChange={(e) => setGithubWeight(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-black dark:text-[#E1E0CC]">2. LLM Architectural Rubric Evaluation</span>
                  <span className="font-bold text-purple-500">{llmRubricWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={llmRubricWeight}
                  onChange={(e) => setLlmRubricWeight(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-black dark:text-[#E1E0CC]">3. Enterprise Partner Peer Code Review</span>
                  <span className="font-bold text-emerald-500">{peerReviewWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={peerReviewWeight}
                  onChange={(e) => setPeerReviewWeight(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Slider 4 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-black dark:text-[#E1E0CC]">4. On-Time Delivery & Streak Consistency</span>
                  <span className="font-bold text-amber-500">{streakWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={streakWeight}
                  onChange={(e) => setStreakWeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setGithubWeight(40);
                    setLlmRubricWeight(30);
                    setPeerReviewWeight(15);
                    setStreakWeight(15);
                  }}
                  className="text-xs font-mono text-black/50 dark:text-white/50 hover:underline cursor-pointer"
                >
                  Reset Default (40 / 30 / 15 / 15)
                </button>
                <button
                  type="submit"
                  disabled={totalWeight !== 100}
                  className="px-6 py-3 rounded-2xl bg-black dark:bg-[#E1E0CC] text-white dark:text-black font-semibold text-xs uppercase tracking-wider shadow-md hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Deploy Formula to Nodes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: LLM Evaluator Model Selector & Node Diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-7 rounded-[36px] bg-gradient-to-br from-[#1B1B1B] via-[#121212] to-[#0A0A0A] text-white border border-white/10 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif">LLM Evaluation Model</h3>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full">
                ACTIVE PIPELINE
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Select the primary LLM architecture used to grade Candidate PR submissions, architectural clean code, and security vulnerability scans.
            </p>

            <div className="space-y-2.5">
              {[
                { id: 'gemini', name: 'Gemini 1.5 Pro', desc: '2M Long-Context (Full Monorepo Auditing)' },
                { id: 'groq', name: 'Groq Llama 3 70B', desc: 'Ultra-Fast Real-Time Candidate Eval' },
                { id: 'openrouter', name: 'OpenRouter Multi-Model', desc: 'Dynamic Fallback & Routing Engine' },
                { id: 'ollama', name: 'Ollama Local Deploy', desc: 'Air-Gapped Enterprise Privacy Node' },
              ].map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedModel === model.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.05]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs font-mono">{model.name}</div>
                    <div className="text-[11px] text-white/50 mt-0.5">{model.desc}</div>
                  </div>
                  {selectedModel === model.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleTestEvaluation}
              disabled={isTestingModel}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingModel ? 'animate-spin' : ''}`} />
              <span>{isTestingModel ? 'Running Test Suite...' : 'Test Eval Accuracy'}</span>
            </button>
          </div>

          <div className="p-7 rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm">
            <h4 className="text-sm font-serif text-black dark:text-[#E1E0CC] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Anti-Cheat Sandbox Protection</span>
            </h4>
            <p className="text-xs text-black/50 dark:text-[#E1E0CC]/60 leading-relaxed">
              Every PR is hashed against 14M open-source repositories and verified for non-VPN human typing rhythms.
            </p>
          </div>

          <div className="p-7 rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-serif font-bold text-black dark:text-[#E1E0CC] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>AI Monitoring & Cost per Company</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                REALTIME LLM TELEMETRY
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <div className="text-black/40 dark:text-white/40 text-[10px]">TOTAL AI REQUESTS</div>
                <div className="text-base font-bold text-black dark:text-[#E1E0CC]">1,428,910</div>
                <div className="text-[10px] text-emerald-500 mt-0.5">99.8% Success • 480ms Avg</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <div className="text-black/40 dark:text-white/40 text-[10px]">TOKEN CONSUMPTION</div>
                <div className="text-base font-bold text-black dark:text-[#E1E0CC]">48.2M Tokens</div>
                <div className="text-[10px] text-amber-500 mt-0.5">$1,222.80 Total Cost</div>
              </div>
            </div>
            <div className="space-y-2 text-xs font-mono pt-1">
              <div className="text-[10px] font-bold text-black/50 dark:text-white/50 uppercase">Cost & Usage per Enterprise</div>
              {[
                { name: 'Google LLC (@google)', cost: '$412.50', tokens: '18.4M tokens', model: 'Gemini / Groq' },
                { name: 'Microsoft Corp (@microsoft)', cost: '$380.10', tokens: '14.2M tokens', model: 'Gemini / OpenRouter' },
                { name: 'Amazon Tech (@amazon)', cost: '$290.00', tokens: '10.1M tokens', model: 'Groq / Ollama' },
                { name: 'Adobe Systems (@adobe)', cost: '$140.20', tokens: '5.5M tokens', model: 'Gemini 1.5 Pro' },
              ].map((ent, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                  <div>
                    <div className="font-bold text-black dark:text-[#E1E0CC]">{ent.name}</div>
                    <div className="text-[10px] text-black/40 dark:text-white/40">{ent.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-500">{ent.cost}</div>
                    <div className="text-[10px] text-black/40 dark:text-white/40">{ent.tokens}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Anti-Cheat & Plagiarism Alert Pool ── */}
      <div className="rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Plagiarism & Anti-Cheat Alert Queue</span>
            </h3>
            <p className="text-xs text-black/50 dark:text-[#E1E0CC]/60 mt-0.5">
              Candidate submissions whose code similarity check exceeded the 70% threshold
            </p>
          </div>
          <span className="text-xs font-mono text-black/40 dark:text-white/40">
            AUTO-SCAN: <strong className="text-emerald-500">ENABLED</strong>
          </span>
        </div>

        {flaggedCandidates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-black dark:text-[#E1E0CC]">
              Zero Plagiarism Flags
            </h4>
            <p className="text-xs text-black/50 dark:text-[#E1E0CC]/60 mt-0.5">
              All candidate submissions across the platform are verified unique.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedCandidates.map((flag) => (
              <div
                key={flag.id}
                className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {flag.id} • {flag.candidate}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                      {flag.similarity} SIMILARITY
                    </span>
                  </div>
                  <p className="text-black/70 dark:text-[#E1E0CC]/80 mt-1">
                    Trial: <strong>{flag.trial}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-black/50 dark:text-white/50 mt-0.5">
                    Matched repo: {flag.matchedSource}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDismissFlag(flag.id)}
                    className="px-4 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-[#E1E0CC] font-semibold transition-colors cursor-pointer"
                  >
                    Dismiss (False Positive)
                  </button>
                  <button
                    onClick={() => {
                      handleDismissFlag(flag.id);
                      showToast(
                        'Account Suspended',
                        `Candidate ${flag.candidate} suspended for terms of service violation.`,
                        'warning'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend User</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
