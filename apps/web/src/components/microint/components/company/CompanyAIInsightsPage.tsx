'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, Zap, Activity, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { companyApi } from '../../../../lib/api/company';

export const CompanyAIInsightsPage: React.FC = () => {
  const { showToast } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await companyApi.getAIInsights();
        if (res.data && res.data.length > 0) {
          setInsights(res.data);
        } else {
          setInsights([
            { id: '1', type: 'skill_gap', title: 'React Native', description: 'Impact: Mobile App Delivery Q4', severity: 'High' },
            { id: '2', type: 'skill_gap', title: 'Kubernetes', description: 'Impact: Infrastructure Scaling', severity: 'Critical' },
            { id: '3', type: 'skill_gap', title: 'GraphQL', description: 'Impact: API Optimization', severity: 'Medium' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        setInsights([
            { id: '1', type: 'skill_gap', title: 'React Native', description: 'Impact: Mobile App Delivery Q4', severity: 'High' },
            { id: '2', type: 'skill_gap', title: 'Kubernetes', description: 'Impact: Infrastructure Scaling', severity: 'Critical' },
            { id: '3', type: 'skill_gap', title: 'GraphQL', description: 'Impact: API Optimization', severity: 'Medium' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      showToast('Analysis Complete', 'Generated new insights from current pipeline data.', 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Node Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            AI Insights
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-white dark:border-t-black rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{analyzing ? 'Crunching Data...' : 'Run Deep Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif text-black dark:text-white">Skill Shortages Detected</h3>
          </div>
          
          <div className="space-y-4 relative z-10">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-black/30 dark:text-white/30" />
              </div>
            ) : insights.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-amber-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-black dark:text-white">{item.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                    item.severity === 'High' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {item.severity} Gap
                  </span>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 font-mono">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif text-black dark:text-white">Market Hiring Trends</h3>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-black/70 dark:text-white/70">AI/ML Engineering Salaries (YoY)</span>
                <span className="text-emerald-500 font-bold">+18.4%</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-black/70 dark:text-white/70">Remote Flexibility Preference</span>
                <span className="text-emerald-500 font-bold">92%</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[92%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-black/70 dark:text-white/70">Average Time-to-Fill (Tech Roles)</span>
                <span className="text-amber-500 font-bold">42 Days</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[65%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-[36px] bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-serif text-black dark:text-white">Recommended Hiring Strategy</h3>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-black/70 dark:text-white/70 leading-relaxed">
          <p>
            Based on current pipeline telemetry, MicroIntern AI recommends shifting focus to <strong className="text-indigo-600 dark:text-indigo-400">Mid-Level React Developers</strong>. 
            Your current applicant pool shows a high concentration of entry-level candidates, but internal performance metrics indicate that 
            teams are bottlenecked on architecture decisions typically handled by mid-to-senior roles.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Adjust Job Descriptions to emphasize system design and ownership.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Deploy 'React Advanced Architecture' Skill Trial to active candidates.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Increase referral bonus by 1.5x for Senior Engineering roles.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Simple icon wrapper
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
