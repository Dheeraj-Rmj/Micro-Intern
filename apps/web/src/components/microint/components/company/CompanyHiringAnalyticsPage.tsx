"use client";
import React from "react";
import { Compass, Sparkles } from "lucide-react";

export const CompanyHiringAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 h-[80vh] flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
          <Compass className="w-10 h-10 text-emerald-500 relative z-10" />
        </div>
        
        <div>
          <h1 className="text-3xl font-serif text-black dark:text-white tracking-tight mb-3">
            Analytics Coming Soon
          </h1>
          <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
            We are preparing a powerful suite of hiring analytics to help you visualize candidate performance, funnel conversion, and talent acquisition ROI.
          </p>
        </div>
      </div>
    </div>
  );
};
