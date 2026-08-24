"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  User,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  Home,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Terminal,
  Key,
  Building2,
} from "lucide-react";

interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    userProfile,
    setCurrentRoute,
    currentRoute,
    role,
    setRole,
    darkMode,
    setDarkMode,
    notifications,
    markNotificationRead,
    showToast,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("microintern_current_route");
    }
    showToast("Logged Out", "Signed out safely.", "info");
    setCurrentRoute("landing");
  };

  const candidateNavTabs = [
    { id: "dashboard", label: "Apprentice Hub", icon: Home },
    { id: "discover-trials", label: "Explore Skill Trials", icon: Sparkles },
    { id: "workspace", label: "IDE & Environment", icon: CheckCircle2 },
    { id: "profile", label: "Profile & Portfolio", icon: User },
  ];

  const companyNavTabs = [
    { id: "company-dashboard", label: "Enterprise Hub", icon: LayoutDashboard },
    { id: "company-applications", label: "Applicant Pipeline", icon: Users },
    { id: "company-recruiters", label: "Recruiter Logins", icon: Key },
    { id: "company-manage-trials", label: "Skill Trials", icon: Sparkles },
  ];

  const adminNavTabs = [
    { id: "admin-dashboard", label: "Command Center", icon: LayoutDashboard },
    { id: "admin-users", label: "Users & eKYC", icon: Users },
    { id: "admin-trials", label: "Escrow Trials", icon: Sparkles },
    { id: "admin-trust-ai", label: "AI Engine", icon: ShieldCheck },
  ];

  const isSuperAdminView = currentRoute.startsWith("admin-") || role === "admin";
  const isCompanyView = currentRoute.startsWith("company-") || role === "company";
  const isAdminView = isSuperAdminView || isCompanyView;

  const navTabs = isSuperAdminView
    ? adminNavTabs
    : isCompanyView
      ? companyNavTabs
      : candidateNavTabs;

  return (
    <header className="w-full px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between z-30 relative gap-4">
      {/* Left: Mobile Toggle */}
      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-3 rounded-full bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm text-black dark:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Dynamic Nothing-Style Floating Pill Navigation */}
      <div className="hidden md:flex items-center p-1.5 rounded-full bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm">
        {navTabs.map((tab) => {
          const isActive = currentRoute === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentRoute(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-serif text-xs transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-md font-bold"
                  : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Pill */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3.5 rounded-full bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:scale-105 transition-transform cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-white" />
          ) : (
            <Moon className="w-4 h-4 text-black" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-3.5 rounded-full bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:scale-105 transition-transform relative cursor-pointer"
          >
            <Bell className="w-4 h-4 text-black dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-[#D92B26] border-2 border-white dark:border-[#101010]" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] shadow-2xl p-5 z-50">
              <h4 className="font-bold text-base text-black dark:text-white mb-4">Notifications</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {notifications.length === 0 ? (
                  <p className="text-black/40 dark:text-white/40 text-sm text-center py-4">
                    No notifications.
                  </p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-colors ${
                        n.read
                          ? "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60"
                          : "bg-white/15 dark:bg-white/15 border border-white/20/30 text-black dark:text-white"
                      }`}
                    >
                      <div className="font-bold text-sm mb-1">{n.title}</div>
                      <p className="text-xs opacity-80">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotifDropdownOpen(false);
            }}
            className="w-11 h-11 rounded-full p-0.5 bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:scale-105 transition-transform overflow-hidden cursor-pointer"
          >
            {userProfile.avatar && !imgError ? (
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white text-black font-bold flex items-center justify-center text-sm">
                {userProfile.fullName && userProfile.fullName !== "Avatar"
                  ? userProfile.fullName.charAt(0).toUpperCase()
                  : isSuperAdminView
                    ? "S"
                    : isCompanyView
                      ? "E"
                      : "C"}
              </div>
            )}
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] shadow-2xl p-3 z-50">
              <div className="p-3 mb-2">
                <p className="font-bold text-sm text-black dark:text-white">
                  {userProfile.fullName && userProfile.fullName !== "Avatar"
                    ? userProfile.fullName
                    : isSuperAdminView
                      ? "Super Admin"
                      : isCompanyView
                        ? "Enterprise Admin"
                        : "Candidate"}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">{userProfile.email}</p>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (isSuperAdminView || (role as string) === "admin") {
                      setCurrentRoute("admin-organization");
                    } else if (isCompanyView || (role as string) === "company") {
                      setCurrentRoute("company-settings");
                    } else {
                      setCurrentRoute("profile");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
