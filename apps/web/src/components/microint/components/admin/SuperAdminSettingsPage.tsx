'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Zap,
  Globe,
  DollarSign,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight,
  Database,
  Cpu,
} from 'lucide-react';

export const SuperAdminSettingsPage: React.FC = () => {
  const { showToast } = useApp();

  const [featureFlags, setFeatureFlags] = useState({
    aiReader: true,
    aiSearch: true,
    zenQuotes: true,
    stripeLiveMode: true,
    antiCheatDaemon: true,
    maintenanceMode: false,
  });

  const toggleFlag = (key: keyof typeof featureFlags, label: string) => {
    setFeatureFlags((prev) => {
      const newVal = !prev[key];
      showToast(
        newVal ? 'Feature Enabled' : 'Feature Disabled',
        `Platform feature flag "${label}" has been ${newVal ? 'turned on' : 'disabled'} system-wide.`,
        newVal ? 'success' : 'warning'
      );
      return { ...prev, [key]: newVal };
    });
  };

  const apiGateways = [
    { name: 'Stripe Connect Escrow API', status: 'HEALTHY', latency: '42ms', uptime: '99.99%', lastPing: '1 min ago' },
    { name: 'GitHub Docker Sandbox Runners', status: 'HEALTHY', latency: '180ms', uptime: '99.98%', lastPing: '30 sec ago' },
    { name: 'OpenAI / Anthropic Evaluation Endpoints', status: 'HEALTHY', latency: '310ms', uptime: '99.95%', lastPing: '2 mins ago' },
    { name: 'Tavily Live Web Search API', status: 'HEALTHY', latency: '120ms', uptime: '100.0%', lastPing: '45 sec ago' },
    { name: 'Jina Markdown Reader API v1', status: 'HEALTHY', latency: '95ms', uptime: '100.0%', lastPing: '1 min ago' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-mono text-xs font-bold uppercase tracking-wider">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-[#E1E0CC]/50">
              FEATURE FLAGS & GATEWAYS
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-[#E1E0CC]">
            Platform Settings & Feature Flags
          </h1>
          <p className="text-sm text-black/60 dark:text-[#E1E0CC]/70 mt-1">
            Toggle global application features, inspect API gateway latencies, and manage system maintenance state.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm text-center">
          <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">Global Status</div>
          <div className="text-base font-bold font-mono text-emerald-500">PROD-ACTIVE</div>
        </div>
      </div>

      {/* ── Feature Flag Toggles ── */}
      <div className="p-8 rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Platform Feature Flags</span>
            </h3>
            <p className="text-xs text-black/50 dark:text-[#E1E0CC]/60 mt-0.5">
              Enable or disable widgets and integrations in real time across Candidate and Enterprise portals
            </p>
          </div>
          <span className="text-xs font-mono text-black/40 dark:text-white/40">
            AUTO-PROPAGATION: <strong className="text-emerald-500">INSTANT</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Flag 1: AI Web Reader */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-black dark:text-[#E1E0CC]">AI Web Reader (Jina Markdown)</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                Allow candidates to convert web URLs to LLM-ready markdown on their dashboard
              </p>
            </div>
            <button
              onClick={() => toggleFlag('aiReader', 'AI Web Reader')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.aiReader ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>

          {/* Flag 2: AI Web Search */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-black dark:text-[#E1E0CC]">AI Web Search (Tavily Engine)</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                Real-time technical answers with direct citations for apprentices
              </p>
            </div>
            <button
              onClick={() => toggleFlag('aiSearch', 'AI Web Search')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.aiSearch ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>

          {/* Flag 3: ZenQuotes API */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-black dark:text-[#E1E0CC]">Daily Motivational Quotes API</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                ZenQuotes live motivational banner and ticking clock on candidate dashboard
              </p>
            </div>
            <button
              onClick={() => toggleFlag('zenQuotes', 'Daily Motivational Quotes')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.zenQuotes ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>

          {/* Flag 4: Stripe Connect Escrow */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-black dark:text-[#E1E0CC]">Stripe Connect Escrow Payouts</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                Automated release of enterprise trial stipends upon trial approval
              </p>
            </div>
            <button
              onClick={() => toggleFlag('stripeLiveMode', 'Stripe Live Mode')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.stripeLiveMode ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>

          {/* Flag 5: Anti-Cheat Daemon */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-black dark:text-[#E1E0CC]">AI Plagiarism Anti-Cheat Engine</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                Hash matching against 14M open-source repositories and VPN detection
              </p>
            </div>
            <button
              onClick={() => toggleFlag('antiCheatDaemon', 'Anti-Cheat Engine')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.antiCheatDaemon ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>

          {/* Flag 6: Maintenance Mode */}
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-sm text-red-600 dark:text-red-400">System Maintenance Mode</div>
              <p className="text-xs text-black/60 dark:text-[#E1E0CC]/70">
                Lock all candidate and company access for database migrations
              </p>
            </div>
            <button
              onClick={() => toggleFlag('maintenanceMode', 'System Maintenance Mode')}
              className="text-amber-500 hover:scale-105 transition-transform cursor-pointer"
            >
              {featureFlags.maintenanceMode ? <ToggleRight className="w-8 h-8 text-red-500" /> : <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── API Gateway & Webhook Health Table ── */}
      <div className="p-8 rounded-[36px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC] flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              <span>API Gateways & Webhook Health</span>
            </h3>
            <p className="text-xs text-black/50 dark:text-[#E1E0CC]/60 mt-0.5">
              Live latency, uptime, and HTTP response metrics for external platform endpoints
            </p>
          </div>
          <button
            onClick={() => showToast('Gateways Pinged', 'All 5 external API endpoints returned 200 OK.', 'success')}
            className="px-4 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold text-black dark:text-[#E1E0CC] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ping Gateways</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-[#E1E0CC]/40 bg-black/[0.015] dark:bg-white/[0.02]">
                <th className="py-3.5 px-4">Gateway / Endpoint</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">30-Day Uptime</th>
                <th className="py-3.5 px-4 text-right">Last Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 font-mono">
              {apiGateways.map((gw, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 px-4 font-sans font-semibold text-black dark:text-[#E1E0CC]">
                    {gw.name}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                      {gw.status} (200 OK)
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-black dark:text-[#E1E0CC]">
                    {gw.latency}
                  </td>
                  <td className="py-4 px-4 text-emerald-500 font-bold">
                    {gw.uptime}
                  </td>
                  <td className="py-4 px-4 text-right text-black/40 dark:text-white/40">
                    {gw.lastPing}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
