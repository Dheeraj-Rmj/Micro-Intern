import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, TrendingUp, Users, Box, Zap, ArrowUpRight, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { adminApi } from '../../../../lib/api/admin';

export const SuperAdminSubscriptionsPage: React.FC = () => {
  const { showToast } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await adminApi.getSubscriptionMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
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
    showToast('Data Synced', 'Active subscription tiers and usage limits synced with billing.', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
            Subscription Management
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Manage Free, Starter, Pro, and Enterprise tiers. Track expiry, renewals, seats, storage, and AI credits.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold font-mono">
              +{metrics?.growthRate ?? 0}% MoM
            </span>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Annual Recurring Revenue (ARR)</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-4xl font-serif text-black dark:text-white">${(metrics?.arr ?? 0).toLocaleString()}</span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Monthly (MRR)</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-3xl font-serif text-black dark:text-white">${(metrics?.mrr ?? 0).toLocaleString()}</span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Active Plans</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-3xl font-serif text-black dark:text-white">{metrics?.activePlans?.toLocaleString() ?? 0}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(metrics?.plans ?? []).map((plan: any, i: number) => (
          <div key={i} className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-serif font-bold text-black dark:text-white">{plan.name}</span>
                <span className="text-xs font-mono px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-black/60 dark:text-white/60">${plan.price}/mo</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-serif text-black dark:text-white">{plan.count}</span>
                <span className="text-xs text-black/50 dark:text-white/50 mb-1 font-mono uppercase">Subscribers</span>
              </div>
            </div>
            <button className="mt-6 w-full py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-2 transition-colors">
              <span className="text-xs font-bold text-black dark:text-white">View Accounts</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-black/50 dark:text-white/50" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
