'use client';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const { setCurrentRoute } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentRoute('landing'), 300);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [setCurrentRoute]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col items-center text-center z-10">
        {/* Animated Icon Badge */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 shadow-xl shadow-blue-500/20 ring-1 ring-white/20 animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Revealed Brand Name from LEFT TO RIGHT */}
        <div className="relative overflow-hidden w-full text-center py-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent uppercase drop-shadow-sm">
            MICROINTERN
          </h1>
          {/* Sweep Mask effect moving Left to Right */}
          <div
            className="absolute inset-y-0 left-0 bg-slate-950 transition-all duration-300 ease-out"
            style={{ width: `${100 - progress}%`, left: `${progress}%` }}
          />
        </div>

        {/* Subtitle */}
        <p className="mt-3 text-base md:text-xl font-medium text-slate-300 tracking-wide">
          AI Powered Skill Trial Platform
        </p>

        {/* Progress bar container revealing left to right */}
        <div className="w-full max-w-sm mt-10 h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-400 rounded-full transition-all duration-100 ease-linear shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between w-full max-w-sm text-xs text-slate-400 font-mono">
          <span>INITIALIZING PLATFORM...</span>
          <span>{progress}%</span>
        </div>

        {/* Manual Skip option */}
        <button
          onClick={() => setCurrentRoute('landing')}
          className="mt-12 group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
        >
          <span>Skip loading</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
