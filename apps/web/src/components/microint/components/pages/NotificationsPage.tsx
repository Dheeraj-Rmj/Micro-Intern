'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  Send,
  Info,
  CheckCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, unreadNotificationsCount, showToast } = useApp();
  const [filter, setFilter] = useState<string>('All');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    return n.category === filter.toLowerCase();
  });

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markNotificationRead(n.id));
    showToast('Notifications Read', 'All notifications marked as read.', 'info');
  };

  const getNotifIcon = (category: string) => {
    switch (category) {
      case 'trial':
        return <Sparkles className="w-4 h-4 text-[#111111] dark:text-[#E1E0CC]" />;
      case 'achievement':
        return <CheckCircle2 className="w-4 h-4 text-[#111111] dark:text-[#E1E0CC]" />;
      case 'application':
        return <Send className="w-4 h-4 text-[#111111] dark:text-[#E1E0CC]" />;
      default:
        return <Info className="w-4 h-4 text-[#111111] dark:text-[#E1E0CC]" />;
    }
  };

  return (
    <div className="pb-12 text-[#111111] dark:text-[#E1E0CC] max-w-[1200px] mx-auto w-full font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
        <div>
          <div className="flex items-center gap-3 text-black/40 dark:text-[#E1E0CC]/50 text-sm font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Bell className="w-4 h-4" /> System Alerts
            </span>
            {unreadNotificationsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D92B26] text-white font-extrabold text-[10px] uppercase tracking-widest">
                {unreadNotificationsCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#111111] dark:text-[#E1E0CC]">
            Notifications
          </h1>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-6 py-3 rounded-full bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-[#E1E0CC]/10 text-sm font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer text-[#111111] dark:text-[#E1E0CC]"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 mb-8 p-1.5 bg-black/5 dark:bg-[#101010] rounded-full overflow-x-auto border border-black/5 dark:border-white/10 shadow-sm">
        {['All', 'Unread', 'Trial', 'Application', 'Achievement', 'System'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === f
                ? 'bg-[#111111] text-white dark:bg-[#E1E0CC] dark:text-black shadow-sm'
                : 'text-black/40 dark:text-[#E1E0CC]/50 hover:text-black dark:hover:text-[#E1E0CC]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="grid gap-3">
        {filteredNotifs.length === 0 ? (
          <div className="py-24 px-6 text-center rounded-[40px] bg-white dark:bg-[#101010] border border-black/5 dark:border-white/10 shadow-sm">
            <Bell className="w-10 h-10 text-black/20 dark:text-[#E1E0CC]/30 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-black dark:text-[#E1E0CC]">No notifications</h3>
            <p className="text-sm text-black/50 dark:text-[#E1E0CC]/60 max-w-sm mx-auto mt-2">
              You have no notifications matching this filter category.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-6 rounded-[32px] border transition-all cursor-pointer flex items-start gap-4 ${
                notif.read
                  ? 'bg-white/60 dark:bg-[#101010]/60 border-black/5 dark:border-white/5 opacity-70'
                  : 'bg-white dark:bg-[#101010] border-black/10 dark:border-white/15 shadow-md'
              }`}
            >
              <div
                className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.read
                    ? 'bg-black/5 dark:bg-white/5'
                    : 'bg-[#111111]/10 dark:bg-[#E1E0CC]/15'
                }`}
              >
                {getNotifIcon(notif.category)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-base text-black dark:text-[#E1E0CC]">{notif.title}</h4>
                  <span className="text-xs font-semibold text-black/40 dark:text-[#E1E0CC]/50">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-sm text-black/70 dark:text-[#E1E0CC]/75 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#D92B26] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
