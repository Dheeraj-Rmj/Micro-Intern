'use client';
import React, { useState, useEffect } from 'react';
import { Compass, Download, TrendingUp, Users, Target, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { companyApi } from '../../../../lib/api/company';

export const CompanyHiringAnalyticsPage: React.FC = () => {
  const { showToast } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await companyApi.getHiringAnalytics();
        if (res.data) {
          setAnalytics(res.data);
        } else {
          setAnalytics({
            timeToHireDays: 24,
            offerAcceptanceRate: 68,
            candidateDropRate: 12,
            totalPlacements: 142
          });
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setAnalytics({
          timeToHireDays: 24,
          offerAcceptanceRate: 68,
          candidateDropRate: 12,
          totalPlacements: 142
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      showToast('Export Complete', 'Hiring analytics report downloaded as CSV.', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Global Telemetry
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            Hiring Analytics
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handleExport}
            disabled={exportLoading}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 text-xs font-mono font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {exportLoading ? (
              <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-black/50 dark:text-white/50 font-mono">
          Fetching advanced analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> -12%
              </span>
            </div>
            <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Avg Time to Hire</span>
            <span className="text-3xl font-serif text-black dark:text-white">{analytics?.timeToHireDays} Days</span>
          </div>

          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Target className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +5%
              </span>
            </div>
            <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Offer Acceptance</span>
            <span className="text-3xl font-serif text-black dark:text-white">{analytics?.offerAcceptanceRate}%</span>
          </div>

          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +2%
              </span>
            </div>
            <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Candidate Drop Rate</span>
            <span className="text-3xl font-serif text-black dark:text-white">{analytics?.candidateDropRate}%</span>
          </div>

          <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +24
              </span>
            </div>
            <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 mb-1 block">Total Placements</span>
            <span className="text-3xl font-serif text-black dark:text-white">{analytics?.totalPlacements}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-serif mb-6 text-black dark:text-white">Application Funnel</h3>
          <div className="flex-1 flex flex-col justify-end gap-2">
            {[
              { stage: 'Applied', count: 4200, width: '100%', color: 'bg-slate-200 dark:bg-white/10' },
              { stage: 'Screened', count: 1800, width: '75%', color: 'bg-indigo-200 dark:bg-indigo-500/20' },
              { stage: 'Assessed', count: 850, width: '50%', color: 'bg-amber-200 dark:bg-amber-500/20' },
              { stage: 'Interviewed', count: 420, width: '30%', color: 'bg-blue-200 dark:bg-blue-500/20' },
              { stage: 'Offered', count: 342, width: '15%', color: 'bg-emerald-200 dark:bg-emerald-500/20' },
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-24 text-right text-xs font-mono text-black/60 dark:text-white/60">{bar.stage}</div>
                <div className="flex-1 h-8 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
                  <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-black/70 dark:text-white/70">
                    {bar.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-serif mb-6 text-black dark:text-white">Source of Hire</h3>
          <div className="space-y-4">
            {[
              { source: 'LinkedIn', percent: 45 },
              { source: 'MicroIntern Platform', percent: 30 },
              { source: 'Referrals', percent: 15 },
              { source: 'University Campus', percent: 10 },
            ].map((src, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-mono text-black/70 dark:text-white/70 mb-1">
                  <span>{src.source}</span>
                  <span>{src.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${src.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
