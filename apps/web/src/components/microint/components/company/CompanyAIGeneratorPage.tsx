import React, { useState } from 'react';
import { Bot, Sparkles, Code, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { assessmentApi } from '@/lib/api/assessment';
import { useApp } from '../../context/AppContext';

export const CompanyAIGeneratorPage: React.FC = () => {
  const { setCurrentRoute } = useApp();
  const [projectContext, setProjectContext] = useState('');
  const [techStack, setTechStack] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
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
      console.error('Failed to generate tasks:', error);
      alert('Failed to generate micro-tasks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            AI Micro-Task Generator
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Paste a Jira ticket or project description, and let our AI instantly generate a structured Micro-Internship assessment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            Project Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Context / Jira Ticket
              </label>
              <textarea
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                placeholder="e.g. We need to build a new React login page with JWT authentication and form validation. The design uses TailwindCSS..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. React, Node.js, TypeScript, TailwindCSS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
              >
                <option value="Easy">Easy (Junior / Intern)</option>
                <option value="Medium">Medium (Mid-Level)</option>
                <option value="Hard">Hard (Senior)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !projectContext.trim() || !techStack.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Micro-Tasks...
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

        {/* Output Preview */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
          {/* Glassmorphism gradient effect */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 relative z-10">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Generated Result
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {isGenerating ? (
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/10">
                  <Bot className="w-8 h-8 text-indigo-400 animate-bounce" />
                </div>
                <h3 className="text-xl font-medium text-slate-200">AI is thinking...</h3>
                <p className="text-slate-400 max-w-xs mx-auto">
                  Analyzing project context, extracting requirements, and building a coding challenge rubric.
                </p>
              </div>
            ) : result ? (
              <div className="w-full text-left bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-300 mb-1">Assessment Generated!</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      The micro-tasks have been created and saved as a DRAFT. You can review and publish them in your Trials dashboard.
                    </p>
                    
                    <div className="bg-slate-900/50 rounded-lg p-3 inline-block">
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1">Assessment ID</span>
                      <code className="text-emerald-200 font-mono text-sm">{result.id}</code>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-emerald-500/20 flex justify-end">
                  <button 
                    onClick={() => setCurrentRoute('company-manage-trials')}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View in Trials <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-50">
                <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-slate-400">Provide project details to generate an assessment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
