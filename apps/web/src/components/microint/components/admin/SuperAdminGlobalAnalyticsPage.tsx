"use client";
import React, { useState, useEffect } from "react";
import {
  Globe,
  RefreshCw,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { adminApi } from "../../../../lib/api/admin";

export const SuperAdminGlobalAnalyticsPage: React.FC = () => {
  const { showToast } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await adminApi.getGlobalAnalytics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
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
    showToast("Data Synced", "Global market trends and platform health updated.", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
            Global Analytics
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Platform-wide trends, AI evaluation health, and market skill demands.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-2 p-6 rounded-[32px] bg-indigo-500 text-white shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
                Real-time
              </span>
            </div>
            <span className="text-xs font-mono uppercase text-white/70 mb-1 block">
              Platform Health Score
            </span>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white/50 mt-2" />
            ) : (
              <span className="text-5xl font-serif">
                {metrics?.platformHealthScore?.toFixed(1) ?? 0}/100
              </span>
            )}
            <p className="mt-4 text-sm text-indigo-100">
              Aggregated from {loading ? "..." : metrics?.activeUsersGrowth}% active user growth
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Globe className="w-64 h-64" />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm">
          <h3 className="font-serif text-lg text-black dark:text-white mb-4">
            Top Skills Demanded
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20" />
            </div>
          ) : (
            <div className="space-y-4">
              {(metrics?.topSkillsDemanded ?? []).map((skill: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-black dark:text-white">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-black/60 dark:text-white/60">
                      Idx: {skill.demandIndex}
                    </span>
                    {skill.trend === "up" ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-serif text-lg text-black dark:text-white mb-4">
          Critical Skill Gaps in Talent Pool
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-[32px] bg-black/5 dark:bg-white/5 animate-pulse"
                  />
                ))
            : (metrics?.skillGaps ?? []).map((gap: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:border-red-500/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-black dark:text-white text-lg">
                      {gap.skill}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                      {gap.severity}
                    </span>
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60 font-mono mb-4">
                    Impact: {gap.impact}
                  </p>
                  <div className="w-full bg-black/5 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[85%]" />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
