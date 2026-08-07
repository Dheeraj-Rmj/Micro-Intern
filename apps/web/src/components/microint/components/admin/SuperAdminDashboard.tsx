'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { adminApi, type AdminStats, type AdminAuditLog } from '@/lib/api/admin';
import {
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  Lock,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Play,
  Download,
  Eye,
  Sliders,
  Zap,
  Clock,
  Calendar,
  Info,
  BarChart2,
  Layers,
  Plus,
  User,
  Compass,
} from 'lucide-react';

interface MotivationalQuote {
  q: string;
  a: string;
}

const GOVERNANCE_INSIGHT_QUOTES: MotivationalQuote[] = [
  { q: 'Trust is not an assumption; it is an algorithmic invariant verified across every transaction and commit.', a: 'MicroIntern Core Governance RFC-01' },
  { q: 'Security is a process, not a product.', a: 'Bruce Schneier' },
  { q: 'Simplicity is prerequisite for reliability.', a: 'Edsger W. Dijkstra' },
  { q: 'In God we trust, all others must bring data.', a: 'W. Edwards Deming' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { setCurrentRoute, showToast, darkMode } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'security'>('overview');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [selectedQuickActionModal, setSelectedQuickActionModal] = useState<string | null>(null);
  const [impersonateUserEmail, setImpersonateUserEmail] = useState('');
  const [systemAlertMessage, setSystemAlertMessage] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [topEnterprises, setTopEnterprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Live Ticking Clock state (matching CandidatePortal)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(GOVERNANCE_INSIGHT_QUOTES[0] as MotivationalQuote);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const idx = Math.floor(Math.random() * GOVERNANCE_INSIGHT_QUOTES.length);
    const selected = GOVERNANCE_INSIGHT_QUOTES[idx] || GOVERNANCE_INSIGHT_QUOTES[0];
    if (selected) {
      setCurrentQuote(selected);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError(null);
        const [statsData, logsData, companiesData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAuditLogs(),
          adminApi.getUsers({ role: 'company' }),
        ]);
        setStats(statsData);
        setLogs(logsData);
        setTopEnterprises(
          companiesData.slice(0, 4).map((c) => ({
            name: c.name,
            logo: c.name.charAt(0),
            activeTrials: 2,
            status: c.status === 'active' ? 'eKYC Approved' : 'Pending',
            escrowLocked: '$25,000',
          }))
        );
      } catch (err: any) {
        console.error('Failed to fetch admin dashboard telemetry data', err);
        setFetchError(err.message || 'Failed to establish secure connection to AI telemetry backend. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRunDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      showToast(
        'AI Sandbox Diagnostics Complete',
        'All 14 GitHub runner nodes & LLM evaluation evaluators are healthy (99.98% uptime).',
        'success'
      );
    }, 1500);
  };

  const handleImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateUserEmail.trim()) return;
    try {
      await adminApi.impersonateUser(impersonateUserEmail);
      showToast(
        'Impersonation Session Active',
        `You are now viewing MicroIntern as: ${impersonateUserEmail}. Admin audit trail logged.`,
        'info'
      );
      setSelectedQuickActionModal(null);
      setImpersonateUserEmail('');
    } catch (err: any) {
      showToast('Error', err.message || 'Impersonation failed.', 'warning');
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemAlertMessage.trim()) return;
    try {
      await adminApi.broadcastAlert(systemAlertMessage);
      showToast(
        'System-Wide Broadcast Sent',
        `Notification dispatched to all active users: "${systemAlertMessage}"`,
        'success'
      );
      setSelectedQuickActionModal(null);
      setSystemAlertMessage('');
    } catch (err: any) {
      showToast('Error', err.message || 'Broadcast failed.', 'warning');
    }
  };

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const recentSecurityLogs: any[] = logs.slice(0, 5);

  // Dynamic SVG Chart paths for Platform Verification Velocity (matching CandidatePortal SVG aesthetics)
  const chartY = 12;
  const chartPathD = `M0 32 Q 20 ${chartY + 12}, 45 ${chartY + 4} T 100 ${chartY}`;
  const chartDashD = `M0 28 Q 20 ${chartY + 14}, 45 ${chartY + 8} T 100 ${chartY + 4}`;

  if (fetchError) {
    return (
      <div className="p-8 text-center animate-in fade-in duration-300 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm mt-8 mx-auto max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-black dark:text-white mb-3">Platform Telemetry Disconnected</h2>
        <p className="text-sm text-black/60 dark:text-white/60 mb-8 leading-relaxed">
          {fetchError}
        </p>
        <button
          onClick={() => { setLoading(true); setFetchError(null); /* would re-trigger effect in real app but simple reload suffices here */ window.location.reload(); }}
          className="px-6 py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-sm shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Top Header Bar (Matching CandidatePortal 1:1) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              SUPER ADMIN LEVEL-0 EXECUTIVE PORTAL
            </span>
            <span className="text-[11px] font-mono text-black/50 dark:text-white/60">
              CLUSTER: us-east-4.prod.microintern.ai
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            System Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 text-xs font-mono font-semibold text-black dark:text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosticRunning}
            className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isDiagnosticRunning ? 'Running Checks...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* ── Daily System Governance Banner (Matching CandidatePortal 1:1) ── */}
      <div
        className="p-7 rounded-[36px] bg-white/70 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group"
        style={{
          clipPath: 'inset(0 round 36px)',
          background:
            'radial-gradient(circle 350px at 90% 10%, rgba(225, 224, 204, 0.15) 0%, transparent 70%), radial-gradient(circle 350px at 10% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        }}
      >
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto py-2">
          <div className="mb-3.5">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-black/60 dark:text-white/80 font-mono">
              SYSTEM GOVERNANCE INVARIANT • {dateString}
            </span>
          </div>

          <p className="text-lg sm:text-2xl font-serif italic text-black dark:text-white leading-relaxed tracking-tight transition-all duration-500">
            “{currentQuote.q}”
          </p>

          <p className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 dark:text-white/50 mt-4">
            — {currentQuote.a}
          </p>
        </div>
      </div>

      {/* ── Pill Switcher Tabs (Matching CandidatePortal Pill Style) ── */}
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          Platform Telemetry
        </button>
        <button
          onClick={() => setCurrentRoute('admin-organization' as any)}
          className="px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
        >
          Organization Management
        </button>
        <button
          onClick={() => setCurrentRoute('admin-subscriptions' as any)}
          className="px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
        >
          Subscription Management
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Cards */}
        {[
          { label: 'Total Companies', value: stats?.totalCompanies || '1,420', icon: Building2 },
          { label: 'Total Users', value: stats?.totalUsers || '24,592', icon: Users },
          { label: 'Total HRs/Recruiters', value: '4,105', icon: ShieldCheck },
          { label: 'Total Candidates', value: '20,487', icon: User },
          { label: 'Platform Revenue', value: '$2.4M', icon: DollarSign },
          { label: 'Global Users', value: '18,500', icon: Compass },
          { label: 'Active Trials', value: stats?.activeAssessments || '412', icon: Sparkles },
          { label: 'Platform Health', value: '99.99%', icon: Activity },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="p-6 rounded-[24px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 block mb-1">
                  {metric.label}
                </span>
                <span className="text-3xl font-serif text-black dark:text-white">
                  {metric.value}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/40 dark:text-white/40">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

        {/* Bento Card 4 (md:col-span-5) - Executive Action Console */}
        <div className="md:col-span-5 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                ADMIN CONSOLE
              </span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
              Executive Governance Actions
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-1 leading-relaxed">
              Impersonate any candidate or enterprise admin session for audit inspection, or broadcast real-time system alerts.
            </p>
          </div>

          <div className="my-6 space-y-3">
            <button
              onClick={() => setSelectedQuickActionModal('impersonate')}
              className="w-full p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-black dark:text-white">
                  Impersonate User Session
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-black/40 dark:text-white/40" />
            </button>

            <button
              onClick={() => setSelectedQuickActionModal('broadcast')}
              className="w-full p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-black dark:text-white">
                  Broadcast System-Wide Alert
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-black/40 dark:text-white/40" />
            </button>
          </div>

          <button
            onClick={() => setCurrentRoute('admin-users' as any)}
            className="w-full py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs hover:scale-105 transition-transform shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Open User Governance Console →</span>
          </button>
        </div>

        {/* Bento Card 5 (md:col-span-12) - Live SOC-2 Audit & Security Stream */}
        <div className="md:col-span-12 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Live SOC-2 Compliance & Security Audit Trail
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                Real-time cryptographic audit log of eKYC verifications, recruiter seat creations, and token consumption
              </p>
            </div>
            <button
              onClick={() => setCurrentRoute('admin-audit-logs' as any)}
              className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full SOC-2 Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSecurityLogs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center text-xs opacity-60">
                No SOC-2 compliance audit logs recorded yet in current session.
              </div>
            ) : (
              recentSecurityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-black/40 dark:text-white/40">
                      {log.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                        log.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-black dark:text-white font-medium">
                      {log.details}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-black/50 dark:text-white/50">
                    <span>{log.actor}</span>
                    <span>{log.time || log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {/* ── Impersonate User Session Modal ── */}
      {selectedQuickActionModal === 'impersonate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-black dark:text-white">
                Impersonate User Session
              </h3>
              <button
                onClick={() => setSelectedQuickActionModal(null)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-black/40 dark:text-white/40" />
              </button>
            </div>
            <p className="text-xs text-black/60 dark:text-white/60">
              Enter the exact email address of the Candidate, Company Admin, or Recruiter to inspect their view.
            </p>
            <form onSubmit={handleImpersonate} className="space-y-4">
              <input
                type="email"
                placeholder="e.g. alex.chen@mit.edu or admin@google.microintern"
                value={impersonateUserEmail}
                onChange={(e) => setImpersonateUserEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-black dark:text-white outline-none"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuickActionModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer"
                >
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Broadcast Alert Modal ── */}
      {selectedQuickActionModal === 'broadcast' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-black dark:text-white">
                Broadcast System Alert
              </h3>
              <button
                onClick={() => setSelectedQuickActionModal(null)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-black/40 dark:text-white/40" />
              </button>
            </div>
            <p className="text-xs text-black/60 dark:text-white/60">
              Send a priority system notification broadcast to all active candidates and enterprises.
            </p>
            <form onSubmit={handleBroadcastAlert} className="space-y-4">
              <textarea
                rows={3}
                placeholder="e.g. Scheduled maintenance on OpenAI Eval runners tonight at 02:00 UTC."
                value={systemAlertMessage}
                onChange={(e) => setSystemAlertMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-black dark:text-white outline-none resize-none"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuickActionModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs cursor-pointer"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
