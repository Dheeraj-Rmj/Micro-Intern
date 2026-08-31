import { apiClient } from "./client";

export interface NotificationDTO {
  id: string;
  userId: string;
  channel: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get<{ success: boolean; data: NotificationDTO[] }>("/notifications");
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {});
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch<{ success: boolean }>("/notifications/read-all", {});
    return res.data;
  },
};
