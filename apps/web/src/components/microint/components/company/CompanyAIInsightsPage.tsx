"use client";
import React from "react";
import { Sparkles } from "lucide-react";

export const CompanyAIInsightsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 h-[80vh] flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-purple-500/10 rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
          <Sparkles className="w-10 h-10 text-purple-500 relative z-10" />
        </div>
        
        <div>
          <h1 className="text-3xl font-serif text-black dark:text-white tracking-tight mb-3">
            AI Insights Coming Soon
          </h1>
          <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
            Our AI analysis engine will soon provide deep, actionable insights into candidate problem-solving patterns, skill gaps, and team culture fit across your entire talent pipeline.
          </p>
        </div>
      </div>
    </div>
  );
};
