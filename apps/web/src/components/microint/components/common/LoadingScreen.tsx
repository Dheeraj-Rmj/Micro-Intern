"use client";
import React, { useEffect } from "react";
import { useApp } from "../../context/AppContext";

export const LoadingScreen: React.FC = () => {
  const { setCurrentRoute } = useApp();

  useEffect(() => {
    // A much shorter artificial delay for a professional feel
    const timer = setTimeout(() => setCurrentRoute("landing"), 800);
    return () => clearTimeout(timer);
  }, [setCurrentRoute]);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-200 rounded-full animate-spin" />
      </div>
    </div>
  );
};
