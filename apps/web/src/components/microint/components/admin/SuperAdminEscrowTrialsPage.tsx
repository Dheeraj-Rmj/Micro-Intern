import React, { useState, useEffect } from 'react';
import { Sparkles, DollarSign, ArrowUpRight, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { adminApi } from '../../../../lib/api/admin';

export const SuperAdminEscrowTrialsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getEscrowMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch escrow metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              GLOBAL ESCROW MANAGEMENT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            Escrow Skill Trials
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 flex items-center justify-center text-black dark:text-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Total Value Locked (TVL)</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-3xl font-serif text-black dark:text-white">${metrics?.totalValueLocked?.toLocaleString() ?? 0}</span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 flex items-center justify-center text-black dark:text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Active Escrow Contracts</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-3xl font-serif text-black dark:text-white">{metrics?.activeContracts?.toLocaleString() ?? 0}</span>
          )}
        </div>

        <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 flex items-center justify-center text-black dark:text-white">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Payouts Pending</span>
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20 mt-2" /> : (
            <span className="text-3xl font-serif text-black dark:text-white">${metrics?.payoutsPending?.toLocaleString() ?? 0}</span>
          )}
        </div>
      </div>

      <div className="rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
              Global Escrow Ledger
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-1">
              Active skill trials with Stripe Connect escrow deposits locked.
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search contracts..."
              className="pl-9 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/5 text-xs border border-transparent focus:border-black/20 dark:focus:border-white/20 outline-none w-48 transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          {[
            { id: 'ESC-9481', company: 'Google', title: 'Kubernetes Reliability Engineer', amount: '$4,500', status: 'LOCKED' },
            { id: 'ESC-7721', company: 'Stripe', title: 'Payments Core Infrastructure', amount: '$6,200', status: 'IN_PROGRESS' },
            { id: 'ESC-4492', company: 'Linear', title: 'React Performance Optimization', amount: '$2,800', status: 'LOCKED' },
            { id: 'ESC-1104', company: 'Vercel', title: 'Edge Network Routing', amount: '$5,000', status: 'PAYOUT_READY' },
          ].map((trial, i) => (
            <div key={i} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between group hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#181818] border border-black/5 dark:border-white/10 flex items-center justify-center font-serif text-sm font-bold text-black dark:text-white shadow-sm">
                  {trial.company[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">{trial.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-black/50 dark:text-white/50 font-mono">{trial.company}</span>
                    <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                    <span className="text-[10px] font-mono text-black/40 dark:text-white/40">{trial.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{trial.amount}</div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                    trial.status === 'PAYOUT_READY' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {trial.status.replace('_', ' ')}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
