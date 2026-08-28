"use client";
import React, { useState, useEffect } from "react";
import {
  FileCheck,
  CreditCard,
  Download,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { companyApi } from "../../../../lib/api/company";

export const CompanyBillingPage: React.FC = () => {
  const { showToast } = useApp();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await companyApi.getBilling();
        if (res.data) {
          setBilling(res.data);
        } else {
          setBilling(null);
        }
      } catch (err) {
        console.error("Failed to fetch billing:", err);
        setBilling(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Stripe Billing Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            Billing & Subscription
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => showToast("Redirecting", "Opening Stripe Customer Portal...", "info")}
            className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Manage Plan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="lg:col-span-2 p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-black/20 dark:text-white/20" />
          </div>
        ) : (
          <div className="lg:col-span-2 p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-serif text-black dark:text-white mb-1">
                  {billing?.planName}
                </h2>
                <p className="text-xs font-mono text-black/50 dark:text-white/50">
                  Renews on {new Date(billing?.renewalDate).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider mb-1 block">
                  Recruiter Seats
                </span>
                <span className="text-xl font-bold text-black dark:text-white">
                  {billing?.recruiterSeatsUsed} / {billing?.recruiterSeatsMax}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider mb-1 block">
                  AI Credits (Monthly)
                </span>
                <span className="text-xl font-bold text-black dark:text-white">
                  {(billing?.aiCreditsUsed / 1000).toFixed(1)}k /{" "}
                  {(billing?.aiCreditsMax / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="text-[10px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider mb-1 block">
                  Storage Used
                </span>
                <span className="text-xl font-bold text-black dark:text-white">
                  {Math.round(billing?.storageUsedBytes / 1024 ** 3)} GB /{" "}
                  {Math.round(billing?.storageMaxBytes / 1024 ** 4)} TB
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-black/5 dark:border-white/10 pt-6">
              <h3 className="text-sm font-bold text-black dark:text-white mb-4">
                Included Features
              </h3>
              {[
                "Unlimited Job Postings",
                "Advanced AI Skill Gap Analysis",
                "Custom Organization Roles",
                "Dedicated Success Manager",
                "SLA: 99.9% Uptime Guarantee",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-lg font-serif text-black dark:text-white">Payment Method</h3>
            </div>
            <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-200 dark:bg-white/20 rounded flex items-center justify-center text-[10px] font-bold">
                  VISA
                </div>
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">•••• 4242</div>
                  <div className="text-xs text-black/50 dark:text-white/50">Expires 12/28</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-black dark:text-white" />
                <h3 className="text-lg font-serif text-black dark:text-white">Recent Invoices</h3>
              </div>
            </div>
            <div className="space-y-3">
              {billing?.invoices && billing.invoices.length > 0 ? (
                billing.invoices.map((inv: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors group/inv cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-black dark:text-white">{inv.amount}</div>
                      <div className="text-xs text-black/50 dark:text-white/50">{inv.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {inv.status}
                      </span>
                      <Download className="w-4 h-4 text-black/30 dark:text-white/30 group-hover/inv:text-black dark:group-hover/inv:text-white transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs font-semibold text-black/60 dark:text-white/70">No recent invoices.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
