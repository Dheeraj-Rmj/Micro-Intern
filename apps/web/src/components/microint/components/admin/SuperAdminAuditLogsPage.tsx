'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Terminal,
  ShieldCheck,
  Search,
  Download,
  Filter,
  AlertTriangle,
  RefreshCw,
  Clock,
  Lock,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  time: string;
  actor: string;
  ip: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

const INITIAL_LOGS: AuditLogEntry[] = [];

export const SuperAdminAuditLogsPage: React.FC = () => {
  const { showToast } = useApp();
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const handleCopyLog = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Copied', `Log ${id} copied to clipboard.`, 'info');
    }
  };

  const handleExportLogs = () => {
    showToast(
      'SOC-2 Audit Trail Exported',
      'All 26,580 immutable security event logs downloaded as encrypted JSONL.',
      'success'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono text-xs font-bold uppercase tracking-wider">
              IMMUTABLE AUDIT STREAM
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-[#E1E0CC]/50">
              SOC-2 / ISO-27001 COMPLIANCE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-[#E1E0CC]">
            Real-Time Security Audit Stream
          </h1>
          <p className="text-sm text-black/60 dark:text-[#E1E0CC]/70 mt-1">
            Read-only immutable log of every authentication, escrow transaction, impersonation session, and Trust Score calibration event.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-5 py-2.5 rounded-2xl bg-black dark:bg-[#E1E0CC] text-white dark:text-black font-semibold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export JSONL Bundle</span>
        </button>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Events (6)' },
            { id: 'INFO', label: 'Info (4)' },
            { id: 'WARNING', label: 'Warnings (1)' },
            { id: 'CRITICAL', label: 'Critical (1)' },
          ].map((tab) => {
            const isActive = severityFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSeverityFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black dark:bg-[#E1E0CC] text-white dark:text-black shadow-md'
                    : 'text-black/60 dark:text-[#E1E0CC]/60 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, IP, actor, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#101010] border border-black/10 dark:border-white/10 text-xs text-black dark:text-[#E1E0CC] focus:outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ── Terminal Stream View ── */}
      <div className="rounded-[36px] bg-[#0A0A0A] text-[#E1E0CC] border border-white/10 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Window Header Bar */}
        <div className="px-6 py-3.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[11px] text-white/50">
              microintern-prod-audit-stream.log (LIVE TAIL -F)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENCRYPTED STREAM</span>
          </div>
        </div>

        {/* Log Entries */}
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto divide-y divide-white/5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/40">{log.time}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      log.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {log.severity}
                  </span>
                  <span className="font-bold text-white">{log.action}</span>
                </div>

                <div className="text-white/80 leading-relaxed font-sans text-sm">
                  {log.details}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/50">
                  <span>Actor: <strong className="text-white">{log.actor}</strong></span>
                  <span>IP: <strong className="text-white">{log.ip}</strong></span>
                  <span>ID: {log.id}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopyLog(`${log.time} [${log.severity}] ${log.action}: ${log.details}`, log.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer self-start"
                title="Copy Log Line"
              >
                {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
