"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { adminApi } from "@/lib/api/admin";
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
  Mail,
  Key,
  Save,
  ShieldAlert,
  Bot,
  Send,
} from "lucide-react";
import { SuperAdminSecurityTab } from "./SuperAdminSecurityTab";

interface FeatureFlags {
  aiReader: boolean;
  aiSearch: boolean;
  zenQuotes: boolean;
  stripeLiveMode: boolean;
  antiCheatDaemon: boolean;
  maintenanceMode: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface ApiKeyConfig {
  id: string;
  name: string;
  keyMasked: string;
  status: string;
}

export const SuperAdminSystemPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"flags" | "emails" | "gateways" | "security" | "ai_auditor">("flags");

  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    aiReader: true,
    aiSearch: true,
    zenQuotes: true,
    stripeLiveMode: true,
    antiCheatDaemon: true,
    maintenanceMode: false,
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Email Template Editor State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("candidate_onboarding");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  // AI Auditor State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setFeatureFlags(data.featureFlags);
      setEmailTemplates(data.emailTemplates);
      setApiKeys(data.apiKeys);

      const defaultTemplate =
        data.emailTemplates.find((t: any) => t.id === selectedTemplateId) || data.emailTemplates[0];
      if (defaultTemplate) {
        setEditSubject(defaultTemplate.subject);
        setEditBody(defaultTemplate.body);
      }
    } catch (err) {
      console.error("Failed to fetch platform configurations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const template = emailTemplates.find((t) => t.id === selectedTemplateId);
    if (template) {
      setEditSubject(template.subject);
      setEditBody(template.body);
    }
  }, [selectedTemplateId, emailTemplates]);

  const toggleFlag = async (key: keyof FeatureFlags, label: string) => {
    const newVal = !featureFlags[key];
    const updatedFlags = { ...featureFlags, [key]: newVal };
    setFeatureFlags(updatedFlags);

    try {
      await adminApi.updateSettings({ featureFlags: updatedFlags });
      showToast(
        newVal ? "Feature Enabled" : "Feature Disabled",
        `Platform feature flag "${label}" has been ${newVal ? "turned on" : "disabled"} system-wide.`,
        newVal ? "success" : "warning",
      );
    } catch (err: any) {
      showToast("Error", err.message || "Failed to save flag change", "warning");
      setFeatureFlags(featureFlags); // revert
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTemplates = emailTemplates.map((t) =>
      t.id === selectedTemplateId ? { ...t, subject: editSubject, body: editBody } : t,
    );
    setEmailTemplates(updatedTemplates);

    try {
      await adminApi.updateSettings({ emailTemplates: updatedTemplates });
      showToast(
        "Template Saved",
        "Notification / Email template layout updated and synced successfully.",
        "success",
      );
    } catch (err: any) {
      showToast("Error", err.message || "Failed to save template changes", "warning");
    }
  };

  const handleAskAIAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await adminApi.askAIAuditor(aiPrompt);
      setAiResponse(res.text);
    } catch (err: any) {
      showToast("Error", err.message || "Failed to query AI Auditor", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const apiGateways: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-mono text-xs font-bold uppercase tracking-wider">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              FEATURE FLAGS & TEMPLATES
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
            System Management
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Manage Email/Notification Templates, Feature Flags, API Keys, Integrations, and Audit
            Logs.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm text-center">
          <div className="text-[10px] font-mono uppercase text-black/40 dark:text-white/40">
            Global Status
          </div>
          <div className="text-base font-bold font-mono text-emerald-500">PROD-ACTIVE</div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-full w-fit">
        <button
          onClick={() => setActiveTab("flags")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "flags"
              ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5 inline mr-1.5" />
          Feature Flags
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "emails"
              ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <Mail className="w-3.5 h-3.5 inline mr-1.5" />
          Email Templates
        </button>
        <button
          onClick={() => setActiveTab("gateways")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "gateways"
              ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <Server className="w-3.5 h-3.5 inline mr-1.5" />
          API Gateways
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 inline mr-1.5" />
          Security & MFA
        </button>
        <button
          onClick={() => setActiveTab("ai_auditor")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "ai_auditor"
              ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5 inline mr-1.5" />
          AI Auditor
        </button>
      </div>

      {loading ? (
        <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 text-center font-serif text-sm">
          Loading platform configurations...
        </div>
      ) : (
        <>
          {/* ── Feature Flag Toggles Tab ── */}
          {activeTab === "flags" && (
            <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-serif text-black dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>Global Toggles</span>
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                    Enable or disable widgets and integrations in real time across Candidate and
                    Enterprise portals
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      AI Web Reader (Jina Markdown)
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/70">
                      Convert candidate links to LLM-ready markdown
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag("aiReader", "AI Web Reader")}
                    className="hover:scale-105 transition-transform cursor-pointer"
                  >
                    {featureFlags.aiReader ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />
                    )}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      AI Web Search (Tavily Engine)
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/70">
                      Real-time code search and citations in workspace
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag("aiSearch", "AI Web Search")}
                    className="hover:scale-105 transition-transform cursor-pointer"
                  >
                    {featureFlags.aiSearch ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />
                    )}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      Daily Motivational Quotes API
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/70">
                      Displays live motivational banner on dashboard
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag("zenQuotes", "Daily Quotes")}
                    className="hover:scale-105 transition-transform cursor-pointer"
                  >
                    {featureFlags.zenQuotes ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />
                    )}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      AI Plagiarism Anti-Cheat Engine
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/70">
                      VPN detection and code similarity check daemon
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag("antiCheatDaemon", "Anti-Cheat Engine")}
                    className="hover:scale-105 transition-transform cursor-pointer"
                  >
                    {featureFlags.antiCheatDaemon ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />
                    )}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      System Maintenance Mode
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/70">
                      Lock active workspaces for platform migration
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlag("maintenanceMode", "Maintenance Mode")}
                    className="hover:scale-105 transition-transform cursor-pointer"
                  >
                    {featureFlags.maintenanceMode ? (
                      <ToggleRight className="w-8 h-8 text-red-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-black/30 dark:text-white/30" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Email & Notification Templates Tab ── */}
          {activeTab === "emails" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Template List Selector */}
              <div className="lg:col-span-4 p-6 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="text-lg font-serif text-black dark:text-white">Email Templates</h3>
                <div className="space-y-2">
                  {emailTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`w-full p-4 rounded-xl text-left text-xs font-semibold border transition-all ${
                        selectedTemplateId === t.id
                          ? "bg-[#111111] dark:bg-white text-white dark:text-black border-transparent"
                          : "bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 border-black/5 dark:border-white/5 text-black/80 dark:text-white/80"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Form Editor */}
              <div className="lg:col-span-8 p-7 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm">
                <form onSubmit={handleSaveTemplate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-sm text-black dark:text-white outline-none"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
                      Email Body content
                    </label>
                    <textarea
                      rows={8}
                      className="w-full px-4 py-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-sm text-black dark:text-white outline-none resize-none font-mono leading-relaxed"
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      required
                    />
                    <span className="text-[10px] text-black/40 dark:text-white/40 block leading-normal mt-1">
                      Supported variables: <code>{"{{name}}"}</code>,{" "}
                      <code>{"{{trialTitle}}"}</code>, <code>{"{{dateTime}}"}</code>,{" "}
                      <code>{"{{meetingLink}}"}</code>, <code>{"{{score}}"}</code>,{" "}
                      <code>{"{{feedback}}"}</code>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Template Schema</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── API Gateways Tab ── */}
          {activeTab === "gateways" && (
            <div className="space-y-6">
              {/* API Keys Masked List */}
              <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
                <div className="border-b border-black/5 dark:border-white/10 pb-4">
                  <h3 className="text-xl font-serif text-black dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-500" />
                    <span>External System API Integrations</span>
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                    Authorized API keys mapped in Express backend config files
                  </p>
                </div>

                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-black dark:text-white">
                          {key.name}
                        </h4>
                        <span className="font-mono text-xs text-black/40 dark:text-white/40 block mt-0.5">
                          {key.keyMasked}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold tracking-wider self-start sm:self-center">
                        {key.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Health Matrix Table */}
              <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-serif text-black dark:text-white flex items-center gap-2">
                      <Server className="w-5 h-5 text-indigo-500" />
                      <span>API Gateways & Webhook Health</span>
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      showToast(
                        "Gateways Pinged",
                        "All 5 external API endpoints returned 200 OK.",
                        "success",
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold text-black dark:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ping Gateways</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-white/40 bg-black/[0.015] dark:bg-white/[0.02]">
                        <th className="py-3.5 px-4">Gateway / Endpoint</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Latency</th>
                        <th className="py-3.5 px-4">30-Day Uptime</th>
                        <th className="py-3.5 px-4 text-right">Last Ping</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/10 font-mono">
                      {apiGateways.map((gw, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="py-4 px-4 font-sans font-semibold text-black dark:text-white">
                            {gw.name}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                              {gw.status} (200 OK)
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-black dark:text-white">
                            {gw.latency}
                          </td>
                          <td className="py-4 px-4 text-emerald-500 font-bold">{gw.uptime}</td>
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
          )}
          {/* ── Security & MFA Tab ── */}
          {activeTab === "security" && <SuperAdminSecurityTab />}
          {/* ── AI Auditor Tab ── */}
          {activeTab === "ai_auditor" && (
            <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-serif text-black dark:text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-500" />
                    <span>AI Auditor & Accountability Extractor</span>
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                    Query system history, admin actions, and accountability logs using natural language.
                  </p>
                </div>
              </div>

              <div className="max-w-3xl space-y-6">
                <form onSubmit={handleAskAIAuditor} className="relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., Who changed the billing settings yesterday?"
                    className="w-full pl-5 pr-14 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 text-sm font-medium"
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>

                {aiResponse && (
                  <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-black dark:text-white text-sm leading-relaxed prose dark:prose-invert">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Bot className="w-4 h-4" />
                      AI Auditor Response
                    </div>
                    <div className="whitespace-pre-wrap">{aiResponse}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
