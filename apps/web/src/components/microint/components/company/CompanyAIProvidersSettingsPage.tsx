"use client";
import React, { useState, useEffect } from "react";
import { companyApi } from "../../../../lib/api/company";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Plus, Trash2, Key, Bot, AlertTriangle, Edit2 } from "lucide-react";

export const CompanyAIProvidersSettingsPage: React.FC = () => {
  const { showToast } = useApp();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [provider, setProvider] = useState("OPENROUTER");
  const [apiKey, setApiKey] = useState("");
  const [isFallback, setIsFallback] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getAIProviders();
      setProviders(data || []);
    } catch (err: any) {
      showToast("Error", err.message || "Failed to load AI providers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      showToast("Error", "API Key is required", "error");
      return;
    }
    
    try {
      setAdding(true);
      await companyApi.addAIProvider({ provider, apiKey, isFallback });
      showToast("Success", `${provider} key added successfully.`, "success");
      setApiKey("");
      fetchProviders();
    } catch (err: any) {
      showToast("Error", err.message || "Failed to add AI provider", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProvider = async (providerName: string) => {
    if (!confirm(`Are you sure you want to delete the API key for ${providerName}?`)) return;
    
    try {
      await companyApi.deleteAIProvider(providerName);
      showToast("Success", `${providerName} key deleted successfully.`, "success");
      fetchProviders();
    } catch (err: any) {
      showToast("Error", err.message || "Failed to delete AI provider", "error");
    }
  };

  const handleEditProvider = (p: any) => {
    setProvider(p.provider);
    setIsFallback(p.isFallback);
    setApiKey(""); // Reset API key so they can enter a new one
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Info", "Enter a new API key for " + p.provider + " and click Save to update it.", "info");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Bring Your Own Key (BYOK)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            AI Provider Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-black/5 dark:border-white/10 p-6">
            <h2 className="text-xl font-serif text-black dark:text-white mb-4">Configured Providers</h2>
            
            {loading ? (
              <div className="py-8 text-center text-black/50 dark:text-white/50">Loading providers...</div>
            ) : providers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                <Bot className="w-10 h-10 mx-auto text-black/30 dark:text-white/30 mb-2" />
                <p className="text-black/60 dark:text-white/60">No custom AI providers configured.</p>
                <p className="text-sm text-black/40 dark:text-white/40 mt-1">
                  Using MicroIntern&apos;s default platform AI infrastructure.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-black/70 dark:text-white/70" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-black dark:text-white">{p.provider}</h3>
                          {p.isFallback ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono">FALLBACK</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">PRIMARY</span>
                          )}
                        </div>
                        <div className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          API Key Configured and Encrypted
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProvider(p)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Edit Provider Key"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(p.provider)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Provider Key"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-black/5 dark:border-white/10 p-6">
            <h2 className="text-xl font-serif text-black dark:text-white mb-4">Add Provider</h2>
            <form onSubmit={handleAddProvider} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Provider Network</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="OPENROUTER">OpenRouter (Recommended)</option>
                  <option value="GROQ">Groq</option>
                  <option value="GEMINI">Google Gemini</option>
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="MISTRAL">Mistral AI</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/70 dark:text-white/70">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-mono"
                  required
                />
              </div>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFallback}
                  onChange={(e) => setIsFallback(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-black dark:text-white">Use as Fallback</div>
                  <div className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                    Recommended. If disabled, this provider will be the primary engine for your tenant, handling all candidate evaluations.
                  </div>
                </div>
              </label>

              <button
                type="submit"
                disabled={adding || !apiKey}
                className="w-full py-2.5 bg-[#111111] dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save API Key
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Security Notice</p>
              <p className="text-amber-600 dark:text-amber-500 text-xs">
                Your API keys are encrypted at rest using AES-256-GCM. They will never be exposed via the API or frontend after being saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
