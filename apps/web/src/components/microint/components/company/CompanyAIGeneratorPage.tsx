import React, { useState } from "react";
import { Bot, Sparkles, Code, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { assessmentApi } from "@/lib/api/assessment";
import { useApp } from "../../context/AppContext";

export const CompanyAIGeneratorPage: React.FC = () => {
  const { setCurrentRoute } = useApp();
  const [projectContext, setProjectContext] = useState("");
  const [techStack, setTechStack] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!projectContext.trim() || !techStack.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await assessmentApi.generateMicroTasks({
        projectContext,
        techStack,
        difficulty,
      });
      setResult(response);
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      alert("Failed to generate micro-tasks. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Micro-Task Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg max-w-2xl leading-relaxed">
            Paste a Jira ticket or project description, and let our AI instantly generate a
            structured, real-world skill assessment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Input Form Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            Project Details
          </h2>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                Project Context / Jira Ticket
              </label>
              <textarea
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none shadow-sm"
                placeholder="e.g. We need to build a new React login page with JWT authentication and form validation. The design uses TailwindCSS..."
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                placeholder="e.g. React, Node.js, TypeScript, TailwindCSS"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none shadow-sm cursor-pointer"
                >
                  <option value="Easy">Easy (Junior / Intern)</option>
                  <option value="Medium">Medium (Mid-Level)</option>
                  <option value="Hard">Hard (Senior)</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !projectContext.trim() || !techStack.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Preview Panel */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 min-h-[500px] flex flex-col relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
            <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            Generated Result
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full">
            {isGenerating ? (
              <div className="text-center space-y-6 w-full max-w-md mx-auto">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border border-indigo-100 dark:border-indigo-900">
                    <Bot className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Synthesizing Tasks
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Analyzing context, mapping skills, and building a comprehensive coding challenge
                    rubric...
                  </p>
                </div>

                {/* Progress bar skeleton */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-1/2 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            ) : result ? (
              <div className="w-full text-left bg-white dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/30 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">
                      Assessment Ready!
                    </h3>
                    <p className="text-slate-600 dark:text-emerald-200/70 mb-6 leading-relaxed">
                      The micro-tasks have been successfully drafted based on your Jira
                      requirements. They are now pending your final review.
                    </p>

                    <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 inline-flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Assessment ID
                      </span>
                      <code className="text-slate-800 dark:text-emerald-300 font-mono text-sm font-semibold">
                        {result.id}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-emerald-900/30 flex justify-end">
                  <button
                    onClick={() => setCurrentRoute("company-manage-trials")}
                    className="group flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-white dark:text-emerald-400 rounded-xl font-semibold transition-all shadow-md dark:shadow-none"
                  >
                    Review in Dashboard
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 opacity-60">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Fill in the project details on the left, and watch the AI instantly build your
                    assessment tasks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
