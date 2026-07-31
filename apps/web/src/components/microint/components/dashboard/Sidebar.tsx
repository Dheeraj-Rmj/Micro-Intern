'use client';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageRoute } from '../../types';
import {
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
  Sparkles,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentRoute,
    setCurrentRoute,
    unreadNotificationsCount,
    showToast,
    userProfile,
  } = useApp();

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'CP';
    const parts = name.trim().split(' ');
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (parts.length >= 2 && first && last && first[0] && last[0]) {
      return (first[0] + last[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleNavigate = (route: PageRoute) => {
    setCurrentRoute(route);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('microintern_current_route');
    }
    showToast('Logged Out', 'You have been safely signed out.', 'info');
    setCurrentRoute('landing');
    if (setMobileOpen) setMobileOpen(false);
  };

  const candidateMenuItems = [
    { id: 'dashboard' as PageRoute, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as PageRoute, label: 'My Profile', icon: User },
    { id: 'discover-trials' as PageRoute, label: 'Discover Trials', icon: Compass },
    { id: 'my-applications' as PageRoute, label: 'My Applications', icon: FileCheck },
    { id: 'workspace' as PageRoute, label: 'Workspace', icon: Code2 },
    { id: 'submissions' as PageRoute, label: 'Submissions', icon: Send },
    { id: 'notifications' as PageRoute, label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'achievements' as PageRoute, label: 'Achievements', icon: Award },
    { id: 'settings' as PageRoute, label: 'Settings', icon: Settings },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-4 select-none overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <Logo size="md" onClick={() => handleNavigate('landing')} />
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Workspace Mode Tag */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Workspace</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Candidate Portal
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-5 space-y-1">
          {candidateMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Info & Logout */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-4">
        <div
          onClick={() => handleNavigate('profile')}
          className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400 dark:ring-blue-600" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-600">
              {getInitials(userProfile.fullName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {userProfile.fullName || 'Candidate Profile'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {userProfile.email || 'Complete profile'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen && setMobileOpen(false)} />
          <div className="relative w-64 h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
};
