import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  isNotificationsOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isNotificationsOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  setNotificationsOpen: (open: boolean) => set({ isNotificationsOpen: open }),
}));
