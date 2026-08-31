import React, { useState, useEffect } from "react";
import { 
  Settings, 
  MessageSquare, 
  Webhook, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Link as LinkIcon, 
  AlertCircle 
} from "lucide-react";
import { integrationsApi, SlackConfig, WebhookConfig } from "../../../../lib/api/integrations";

export const CompanyIntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"slack" | "webhooks">("slack");
  
  // Slack State
  const [slackConfig, setSlackConfig] = useState<SlackConfig | null>(null);
  const [slackLoading, setSlackLoading] = useState(false);
  const [isConnectingSlack, setIsConnectingSlack] = useState(false);
  
  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  const availableEvents = [
    "trial.created",
    "application.submitted",
    "interview.scheduled",
    "evaluation.completed"
  ];

  useEffect(() => {
    if (activeTab === "slack") {
      fetchSlackConfig();
    } else {
      fetchWebhooks();
    }
  }, [activeTab]);

  const fetchSlackConfig = async () => {
    try {
      setSlackLoading(true);
      const config = await integrationsApi.getSlackConfig();
      setSlackConfig(config);
    } catch (error) {
      console.error("Failed to fetch Slack config", error);
    } finally {
      setSlackLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      setWebhooksLoading(true);
      const data = await integrationsApi.getWebhooks();
      setWebhooks(data);
    } catch (error) {
      console.error("Failed to fetch webhooks", error);
    } finally {
      setWebhooksLoading(false);
    }
  };

  const handleConnectSlack = async () => {
    setIsConnectingSlack(true);
    // In a real app, this would redirect to Slack OAuth
    setTimeout(() => {
      setSlackConfig({
        workspaceId: "T12345",
        workspaceName: "My Company",
        channelMapping: { "recruitment": "#general" },
        connectedAt: new Date().toISOString()
      });
      setIsConnectingSlack(false);
    }, 1000);
  };

  const handleDisconnectSlack = async () => {
    try {
      await integrationsApi.disconnectSlack();
      setSlackConfig(null);
    } catch (error) {
      console.error("Failed to disconnect Slack", error);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl) return;
    try {
      setIsCreatingWebhook(true);
      const newWebhook = await integrationsApi.createWebhook({
        url: newWebhookUrl,
        events: newWebhookEvents,
        isActive: true,
      });
      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl("");
      setNewWebhookEvents([]);
    } catch (error) {
      console.error("Failed to create webhook", error);
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await integrationsApi.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete webhook", error);
    }
  };

  const toggleEventSelection = (event: string) => {
    if (newWebhookEvents.includes(event)) {
      setNewWebhookEvents(newWebhookEvents.filter(e => e !== event));
    } else {
      setNewWebhookEvents([...newWebhookEvents, event]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Integrations & Webhooks
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Connect your favorite tools and automate your workflows.
        </p>
      </div>

      <div className="flex space-x-2 border-b border-black/5 dark:border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("slack")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "slack"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
              : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Slack
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "webhooks"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-500"
              : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Webhook className="w-4 h-4" />
          Webhooks
        </button>
      </div>

      <div className="mt-8">
        {activeTab === "slack" ? (
          <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#4A154B]" />
                  Slack Integration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receive notifications in Slack for new applications and updates.
                </p>
              </div>
              {slackConfig ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Not Connected
                </div>
              )}
            </div>

            {slackLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ) : slackConfig ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                      <p className="font-medium text-gray-900 dark:text-white">{slackConfig.workspaceName}</p>
                    </div>
                    <button
                      onClick={handleDisconnectSlack}
                      className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Channel Mapping</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/10 rounded-lg">
                      <span className="text-sm font-medium w-1/3">Recruitment Updates</span>
                      <input 
                        type="text" 
                        placeholder="#channel-name"
                        defaultValue={slackConfig.channelMapping["recruitment"] || ""}
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0"
                      />
                      <button className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={handleConnectSlack}
                  disabled={isConnectingSlack}
                  className="inline-flex items-center gap-2 bg-[#4A154B] hover:bg-[#3A103B] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5" />
                  {isConnectingSlack ? "Connecting..." : "Add to Slack"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-blue-500" />
                Add Webhook
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payload URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      placeholder="https://example.com/webhook"
                      className="block w-full pl-10 pr-3 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Events to trigger
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableEvents.map(event => (
                      <label key={event} className="flex items-center p-3 border border-black/5 dark:border-white/10 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <input
                          type="checkbox"
                          checked={newWebhookEvents.includes(event)}
                          onChange={() => toggleEventSelection(event)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {event}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleCreateWebhook}
                    disabled={isCreatingWebhook || !newWebhookUrl || newWebhookEvents.length === 0}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isCreatingWebhook ? "Saving..." : "Save Webhook"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Webhook className="w-5 h-5 text-gray-500" />
                Configured Webhooks
              </h2>

              {webhooksLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="p-4 border border-black/5 dark:border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-sm">
                            {webhook.url}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webhook.events.map(event => (
                            <span key={event} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          Added {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                  No webhooks configured.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
