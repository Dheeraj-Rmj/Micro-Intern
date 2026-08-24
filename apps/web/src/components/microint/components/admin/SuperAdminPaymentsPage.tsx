"use client";
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  RefreshCw,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { adminApi } from "../../../../lib/api/admin";

export const SuperAdminPaymentsPage: React.FC = () => {
  const { showToast } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await adminApi.getPaymentMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMetrics();
    setIsRefreshing(false);
    showToast("Data Synced", "Global payment metrics and payouts synced.", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
            Global Payments
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Monitor Stripe Connect payouts, transaction volumes, and platform fees.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`}
          />
          <span>{isRefreshing ? "Syncing..." : "Refresh Data"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white text-xs font-bold font-mono uppercase tracking-wider">
              30 Day Trailing
            </span>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">
            Monthly Transaction Volume
          </span>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" />
          ) : (
            <span className="text-4xl font-serif text-black dark:text-white">
              ${(metrics?.monthlyVolume ?? 0).toLocaleString()}
            </span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">
            Successful TX
          </span>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" />
          ) : (
            <span className="text-3xl font-serif text-black dark:text-white">
              {metrics?.successfulTransactions?.toLocaleString() ?? 0}
            </span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">
            Failed TX
          </span>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" />
          ) : (
            <span className="text-3xl font-serif text-black dark:text-white">
              {metrics?.failedTransactions?.toLocaleString() ?? 0}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-serif text-black dark:text-white mb-4">
          Recent Stripe Payouts
        </h3>
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {(metrics?.recentPayouts ?? []).map((payout: any) => (
                <div
                  key={payout.id}
                  className="p-5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-black/60 dark:text-white/60" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-black dark:text-white uppercase">
                        {payout.id}
                      </p>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        {new Date(payout.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-xl text-black dark:text-white">
                      ${payout.amount.toLocaleString()}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        payout.status === "paid"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
