import { apiClient } from "./client";

export interface NetworkAuthor {
  id: string;
  name: string;
  avatar?: string;
  headline?: string;
}

export interface NetworkPost {
  id: string;
  authorId: string;
  content: string;
  postType: string;
  createdAt: string;
  author: NetworkAuthor;
  hasReacted: boolean;
  comments?: any[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface DiscoverProfile {
  id: string;
  name: string;
  headline?: string;
  avatar?: string;
  trustScore: number;
  skills: Array<{
    skill: string;
    level: string;
    verified: boolean;
  }>;
}

export const networkApi = {
  getFeed: async (page = 1, limit = 20) => {
    const res = await apiClient.get<{ success: boolean; data: { posts: NetworkPost[]; pagination: any } }>(`/network/feed?page=${page}&limit=${limit}`);
    return res.data;
  },

  createPost: async (content: string, postType: string = "INSIGHT") => {
    const res = await apiClient.post<{ success: boolean; data: NetworkPost }>("/network/posts", { content, postType });
    return res.data;
  },

  getMyPosts: async (page = 1, limit = 50) => {
    const res = await apiClient.get<{ success: boolean; data: NetworkPost[] }>(`/network/my-posts?page=${page}&limit=${limit}`);
    return res.data;
  },

  getDiscoverProfiles: async () => {
    const res = await apiClient.get<{ success: boolean; data: DiscoverProfile[] }>("/network/discover");
    return res.data;
  },

  sendConnectionRequest: async (recipientId: string, note?: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>("/network/connections", { recipientId, note });
    return res.data;
  },

  getConnections: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>("/network/connections");
    return res.data;
  },

  respondConnectionRequest: async (requesterId: string, status: "ACCEPTED" | "BLOCKED") => {
    const res = await apiClient.put<{ success: boolean; data: any }>("/network/connections/respond", { requesterId, status });
    return res.data;
  },

  getPublicProfile: async (username: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/network/profile/${username}`);
    return res.data;
  },

  addReaction: async (postId: string, type: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/network/posts/${postId}/reactions`, { type });
    return res.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/network/posts/${postId}/comments`, { content });
    return res.data;
  },
};
