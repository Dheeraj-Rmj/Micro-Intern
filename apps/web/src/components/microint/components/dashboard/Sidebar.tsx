"use client";
import React from "react";
import { useApp } from "../../context/AppContext";
import { PageRoute } from "../../types";
import {
  Sparkles,
  LayoutDashboard,
  User,
  Compass,
  FileCheck,
  Code2,
  Send,
  Bell,
  Award,
  Settings,
  LogOut,
  X,
  Users,
  ShieldCheck,
  Terminal,
  Key,
  Bot,
} from "lucide-react";
import { Logo } from "../common/Logo";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentRoute, setCurrentRoute, role, setRole, unreadNotificationsCount, showToast } =
    useApp();

  const handleNavigate = (route: PageRoute) => {
    setCurrentRoute(route);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("microintern_current_route");
    }
    showToast("Signed Out", "You have been logged out of MicroIntern.", "info");
    setCurrentRoute("landing");
    if (setMobileOpen) setMobileOpen(false);
  };

  interface MenuItem {
    id: PageRoute;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const candidateMenuItems: MenuItem[] = [
    { id: "profile" as PageRoute, label: "My Profile", icon: User },
    { id: "network" as PageRoute, label: "Professional Network & Feed", icon: Users },
    { id: "workspace" as PageRoute, label: "Workspace", icon: Code2 },
    { id: "submissions" as PageRoute, label: "Submissions", icon: Send },
    {
      id: "notifications" as PageRoute,
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    { id: "achievements" as PageRoute, label: "Achievements", icon: Award },
    { id: "settings" as PageRoute, label: "Settings", icon: Settings },
  ];

  const companyMenuItems: MenuItem[] = [
    { id: "company-dashboard" as PageRoute, label: "Dashboard", icon: LayoutDashboard },
    { id: "company-recruiters" as PageRoute, label: "Recruiter Management", icon: Users },
    { id: "company-departments" as PageRoute, label: "Department Management", icon: Sparkles },
    { id: "company-hiring-analytics" as PageRoute, label: "Hiring Analytics", icon: Compass },
    { id: "company-billing" as PageRoute, label: "Billing & Subscription", icon: FileCheck },
    { id: "company-ai-insights" as PageRoute, label: "AI Insights", icon: Code2 },
    { id: "company-ai-generator" as PageRoute, label: "AI Task Generator", icon: Bot },
  ];

  const adminMenuItems: MenuItem[] = [
    { id: "admin-dashboard" as PageRoute, label: "Dashboard", icon: LayoutDashboard },
    { id: "admin-organization" as PageRoute, label: "Organization Management", icon: Users },
    { id: "admin-subscriptions" as PageRoute, label: "Subscription Management", icon: Award },
    { id: "admin-ai-analytics" as PageRoute, label: "AI Usage Analytics", icon: Sparkles },
    { id: "admin-payments" as PageRoute, label: "Payment Dashboard", icon: FileCheck },
    { id: "admin-global-analytics" as PageRoute, label: "Global Analytics", icon: Compass },
    { id: "admin-system" as PageRoute, label: "System Management", icon: Settings },
  ];

  const isSuperAdminView = currentRoute.startsWith("admin-") || role === "admin";
  const isCompanyView = currentRoute.startsWith("company-") || role === "company";
  const isAdminView = isSuperAdminView || isCompanyView;
  const menuItems: MenuItem[] = isSuperAdminView
    ? adminMenuItems
    : isCompanyView
      ? companyMenuItems
      : candidateMenuItems;

  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 text-black dark:text-white py-6 px-3 select-none overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-center pb-6 border-b border-black/5 dark:border-white/10 mb-6">
          <Logo size="lg" onClick={() => handleNavigate("landing")} />
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute right-4 top-6 p-1.5 rounded-lg text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                title={item.label}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer mx-auto ${
                  isActive
                    ? isAdminView
                      ? "bg-amber-500 text-black shadow-md font-bold scale-105"
                      : "bg-[#111111] dark:bg-white text-white dark:text-black shadow-md font-bold"
                    : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D92B26] rounded-full border-2 border-white dark:border-[#101010]" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Info, Portal Switcher & Logout */}
      <div className="pt-6 border-t border-black/5 dark:border-white/10 space-y-3 flex flex-col items-center">
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-12 h-12 flex items-center justify-center rounded-full text-black/40 dark:text-white/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-28 h-screen sticky top-0 flex-shrink-0 p-4 pl-6">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-24 h-full z-10 p-4">{content}</div>
        </div>
      )}
    </>
  );
};
