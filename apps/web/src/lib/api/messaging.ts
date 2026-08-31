import { apiClient } from "./client";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface MessageThread {
  journeyId: string;
  messages: Message[];
}

export const messagingApi = {
  getThread: async (threadId: string) => {
    // threadId can be journeyId or connectionId
    const res = await apiClient.get<{ success: boolean; data: MessageThread }>(`/messaging/journey/${threadId}`);
    return res.data;
  },

  sendMessage: async (threadId: string, body: string) => {
    const res = await apiClient.post<{ success: boolean; data: Message }>(`/messaging/journey/${threadId}`, { body });
    return res.data;
  },

  markAsRead: async (threadId: string) => {
    const res = await apiClient.put<{ success: boolean }>(`/messaging/journey/${threadId}/read`);
    return res.data;
  },

  getUnreadCount: async (threadId: string) => {
    const res = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>(`/messaging/journey/${threadId}/unread-count`);
    return res.data;
  }
};
