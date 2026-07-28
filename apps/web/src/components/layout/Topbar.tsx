'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Zap,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  Search
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { authService } from '@/features/auth/services/auth.service';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      router.replace('/auth/login');
    }
  };

  const getInitials = () => {
    if (!user) return 'C';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="hidden text-base font-bold text-white sm:inline-block">
            MicroIntern
          </span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
            CANDIDATE
          </span>
        </Link>
      </div>

      <div className="hidden max-w-sm flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search trials, skills, or applications..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pr-4 pl-10 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <Link
          href="/notifications"
          className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </Link>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md">
            {getInitials()}
          </div>
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-xs font-semibold text-white">
              {user ? `${user.firstName} ${user.lastName}` : 'Candidate'}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.email ?? 'candidate@microintern.com'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="ml-2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
