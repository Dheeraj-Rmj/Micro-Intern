"use client";
import React from "react";
import { Rocket, Sparkles } from "lucide-react";

export const CompanyBillingPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 h-[80vh] flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-amber-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
          <Rocket className="w-10 h-10 text-amber-500 relative z-10" />
        </div>
        
        <div>
          <h1 className="text-3xl font-serif text-black dark:text-white tracking-tight mb-3">
            Billing Coming Soon
          </h1>
          <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
            We are working on bringing you a comprehensive billing and subscription portal. You are currently on an enterprise beta access plan.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-left space-y-3 mt-8">
          <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Beta Plan Features
          </h3>
          <ul className="text-xs text-black/70 dark:text-white/70 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Unlimited Job Postings
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Custom AI Providers (BYOK)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Advanced Analytics
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
