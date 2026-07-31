'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
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
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, setUserProfile, darkMode, setDarkMode, showToast, setCurrentRoute } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'theme'>('profile');

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      showToast('Password Mismatch', 'New passwords do not match.', 'warning');
      return;
    }
    showToast('Security Settings Saved', 'Password and 2FA options updated.', 'success');
  };

  const handleSaveNotifs = () => {
    showToast('Notification Preferences Saved', 'Your email & alert settings have been saved.', 'success');
  };

  return (
    <div>
      <Breadcrumbs currentTitle="Settings" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Candidate Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage account security, notification preferences, and interface appearance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Profile Overview', icon: User },
            { id: 'security', label: 'Security & Password', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'theme', label: 'Appearance & Theme', icon: Sun },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Details</h3>
              <p className="text-xs text-slate-500">
                To edit full personal details, resume upload, or social links, visit the main Profile Editor.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-bold">{userProfile.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-bold">@{userProfile.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="font-bold">{userProfile.email}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentRoute('profile')}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Open Full Profile Editor →
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Password & Authentication</h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityForm.twoFactor}
                    onChange={(e) => setSecurityForm({ ...securityForm, twoFactor: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-xs font-bold">Enable Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-slate-500">Require email verification code on candidate login.</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Update Security Settings
              </button>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>

              <div className="space-y-4">
                {[
                  {
                    key: 'emailTrialShortlist',
                    title: 'Email on Trial Shortlist',
                    desc: 'Get notified instantly when a company shortlists your application for a trial workspace.',
                  },
                  {
                    key: 'emailNewTrials',
                    title: 'Recommended Trial Alerts',
                    desc: 'Weekly email digest of newly published trials matching your tech stack.',
                  },
                  {
                    key: 'trustScoreUpdates',
                    title: 'Trust Score Updates',
                    desc: 'Alerts when your candidate Trust Score increases or badges unlock.',
                  },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(notifPrefs as any)[item.key]}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                      className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveNotifs}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Interface Appearance</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    !darkMode
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 font-bold'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">Light Mode</p>
                      <p className="text-[10px] text-slate-500">Clean SaaS theme</p>
                    </div>
                  </div>
                  {!darkMode && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    darkMode
                      ? 'border-purple-600 bg-slate-800 font-bold'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold">Dark Mode</p>
                      <p className="text-[10px] text-slate-400">Low-glare dark theme</p>
                    </div>
                  </div>
                  {darkMode && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
