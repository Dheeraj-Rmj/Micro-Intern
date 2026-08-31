import { apiClient } from "./client";

export interface SlackConfig {
  workspaceId: string;
  workspaceName: string;
  channelMapping: Record<string, string>;
  connectedAt: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
}

export const integrationsApi = {
  // Slack API
  getSlackConfig: async (): Promise<SlackConfig | null> => {
    try {
      const response = await apiClient.get<{ data: SlackConfig | null }>("/integrations/slack");
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Not connected
      }
      throw error;
    }
  },

  connectSlack: async (code: string): Promise<void> => {
    await apiClient.post("/integrations/slack/connect", { code });
  },

  disconnectSlack: async (): Promise<void> => {
    await apiClient.delete("/integrations/slack");
  },

  updateSlackConfig: async (config: Partial<SlackConfig>): Promise<SlackConfig> => {
    const response = await apiClient.patch<{ data: SlackConfig }>("/integrations/slack", config);
    return response.data.data;
  },

  // Webhooks API
  getWebhooks: async (): Promise<WebhookConfig[]> => {
    const response = await apiClient.get<{ data: WebhookConfig[] }>("/webhook");
    return response.data.data;
  },

  createWebhook: async (data: Omit<WebhookConfig, "id" | "secret" | "createdAt">): Promise<WebhookConfig> => {
    const response = await apiClient.post<{ data: WebhookConfig }>("/webhook", data);
    return response.data.data;
  },

  updateWebhook: async (id: string, data: Partial<WebhookConfig>): Promise<WebhookConfig> => {
    const response = await apiClient.patch<{ data: WebhookConfig }>(`/webhook/${id}`, data);
    return response.data.data;
  },

  deleteWebhook: async (id: string): Promise<void> => {
    await apiClient.delete(`/webhook/${id}`);
  },
};
