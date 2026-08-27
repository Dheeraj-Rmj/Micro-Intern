"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { RecentDevices } from "../auth/RecentDevices";
import {
  Settings,
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  Save,
  CheckCircle2,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  LogOut,
  MapPin,
  Clock,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  Key,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { userProfile, setUserProfile, darkMode, setDarkMode, showToast, setCurrentRoute } =
    useApp();

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "sessions" | "notifications" | "theme"
  >("sessions");

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: true,
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailTrialShortlist: true,
    emailNewTrials: true,
    trustScoreUpdates: true,
    browserPush: false,
  });



  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      showToast("Password Mismatch", "New passwords do not match.", "warning");
      return;
    }
    showToast("Security Settings Saved", "Password and 2FA options updated.", "success");
  };

  const handleSaveNotifs = () => {
    showToast(
      "Notification Preferences Saved",
      "Your email & alert settings have been saved.",
      "success",
    );
  };



  return (
    <div className="pb-12 text-black dark:text-white max-w-[1200px] mx-auto w-full font-sans">
      <Breadcrumbs currentTitle="Settings" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-black dark:text-white">
              Settings & Security
            </h1>
            <p className="text-sm text-black/50 dark:text-white/60 mt-2 font-medium">
              Manage your active device logins, password, notifications, and interface appearance.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 p-1.5 bg-black/5 dark:bg-[#0A0A0A] rounded-full overflow-x-auto border border-black/5 dark:border-white/10 shadow-sm">
          {[
            { id: "sessions", label: "Device Logins & History", icon: Smartphone },
            { id: "security", label: "Password & 2FA", icon: Lock },
            { id: "profile", label: "Profile Shortcut", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "theme", label: "Appearance", icon: Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#111111] text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card Body */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 rounded-[40px] p-6 sm:p-10 shadow-sm">
          {/* ── 1. DEVICE LOGINS & ACTIVE SESSIONS (INSTAGRAM/GOOGLE STYLE) ────── */}
          {activeTab === "sessions" && (
            <div className="flex justify-center w-full">
              <RecentDevices />
            </div>
          )}

          {/* ── 2. PASSWORD & 2FA ────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <h3 className="text-2xl font-serif tracking-tight text-black dark:text-white">
                Password & Security
              </h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/60 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:outline-none focus:border-black/10 dark:focus:border-white/10 text-sm text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/60 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:outline-none focus:border-black/10 dark:focus:border-white/10 text-sm text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/60 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:outline-none focus:border-black/10 dark:focus:border-white/10 text-sm text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black dark:text-white">
                    Two-Factor Authentication (2FA)
                  </h4>
                  <p className="text-xs text-black/50 dark:text-white/60">
                    Require verification code upon new device sign-in
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securityForm.twoFactor}
                  onChange={(e) =>
                    setSecurityForm({ ...securityForm, twoFactor: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#111111] dark:accent-[#E1E0CC] cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-sm"
                >
                  Save Security Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sessions")}
                  className="px-6 py-3.5 rounded-full border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  View Active Devices
                </button>
              </div>
            </form>
          )}

          {/* ── 3. PROFILE SHORTCUT ──────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-center sm:text-left">
              <h3 className="text-2xl font-serif tracking-tight text-black dark:text-white">
                Profile Management
              </h3>
              <p className="text-sm text-black/60 dark:text-white/70">
                To edit your name, photo, portfolio links, or resume file, use our dedicated Profile
                Editor.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setCurrentRoute("profile")}
                  className="px-8 py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-sm"
                >
                  Open Profile Editor
                </button>
              </div>
            </div>
          )}

          {/* ── 4. NOTIFICATIONS ────────────────────────────────────────────── */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-serif tracking-tight text-black dark:text-white">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {[
                  {
                    key: "emailTrialShortlist",
                    title: "Trial Shortlist Alerts",
                    desc: "Notify via email when shortlisted for a micro-trial",
                  },
                  {
                    key: "emailNewTrials",
                    title: "New Trial Recommendations",
                    desc: "Weekly digest of trials matching your skills",
                  },
                  {
                    key: "trustScoreUpdates",
                    title: "Trust Score Updates",
                    desc: "Notify when your Trust Score changes",
                  },
                  {
                    key: "browserPush",
                    title: "Browser Push Notifications",
                    desc: "Instant desktop alerts for messages and updates",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-black dark:text-white">{item.title}</h4>
                      <p className="text-xs text-black/50 dark:text-white/60">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifPrefs as any)[item.key]}
                      onChange={(e) =>
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                      }
                      className="w-5 h-5 accent-[#111111] dark:accent-[#E1E0CC] cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveNotifs}
                  className="px-8 py-3.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-sm"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── 5. THEME / APPEARANCE ────────────────────────────────────────── */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-serif tracking-tight text-black dark:text-white">
                Appearance & Theme
              </h3>
              <p className="text-sm text-black/60 dark:text-white/70">
                Choose between warm Bone-Cream Light Mode or deep sleek Dark Mode.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                    !darkMode
                      ? "border-[#111111] bg-black/5 font-bold shadow-sm"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <Sun
                    className={`w-8 h-8 ${!darkMode ? "text-black" : "text-black/40 dark:text-white/40"}`}
                  />
                  <span className="text-sm text-black dark:text-white">Light Mode</span>
                </button>

                <button
                  onClick={() => setDarkMode(true)}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? "border-white/20 bg-white/5 text-white font-bold shadow-sm"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <Moon
                    className={`w-8 h-8 ${darkMode ? "text-white" : "text-black/50 dark:text-white/50"}`}
                  />
                  <span className="text-sm text-black dark:text-white">Dark Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
