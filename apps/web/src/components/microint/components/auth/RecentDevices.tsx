"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../../../lib/api/client";
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Monitor, 
  Globe, 
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import type { DeviceSession } from "@microintern/shared";

const DeviceIcon = ({ type, os }: { type: string; os: string }) => {
  const osLower = (os || "").toLowerCase();
  
  if (type === "mobile") {
    return <Smartphone className="w-5 h-5 text-emerald-600" />;
  }
  if (type === "tablet") {
    return <Tablet className="w-5 h-5 text-sky-600" />;
  }
  
  // Desktop OS specific icons
  if (osLower.includes("mac") || osLower.includes("ios")) {
    return <Laptop className="w-5 h-5 text-slate-800" />;
  }
  if (osLower.includes("windows")) {
    return <Monitor className="w-5 h-5 text-blue-600" />;
  }
  if (osLower.includes("linux")) {
    return <Monitor className="w-5 h-5 text-amber-600" />;
  }
  
  return <Laptop className="w-5 h-5 text-indigo-500" />;
};

const SkeletonCard = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl bg-white/40 dark:bg-[#0A0A0A]/40 border border-black/5 dark:border-white/5 shadow-sm animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10" />
      <div className="space-y-2">
        <div className="w-32 h-4 rounded-md bg-black/5 dark:bg-white/10" />
        <div className="w-48 h-3 rounded-md bg-black/5 dark:bg-white/10" />
      </div>
    </div>
  </div>
);

export const RecentDevices = () => {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiClient.get<{ data: { sessions: DeviceSession[] } }>("/auth/sessions", {
        skipAuthRefresh: true
      } as any);
      setSessions(response.data?.data?.sessions || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`, {
        skipAuthRefresh: true
      } as any);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session", err);
    } finally {
      setRevokingId(null);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "Unknown time";
      
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Active now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      
      return `${diffDays} days ago`;
    } catch {
      return "Unknown time";
    }
  };

  if (error) {
    return (
      <div className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[32px] p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black dark:text-white mb-2">Unable to load recent login activity.</h2>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">There was a problem securely fetching your device history.</p>
        <button 
          onClick={fetchSessions}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif tracking-tight text-black dark:text-white flex items-center gap-2">
            Recently Logged-In Devices
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Review where your account has recently been accessed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white/40 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10">
            <Globe className="w-10 h-10 text-black/20 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">No recent login activity</h3>
            <p className="text-sm text-black/50 dark:text-white/50">Recent login information will appear here when you sign in.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isCurrent = session.isCurrent;
            const location = session.location || (session.city && session.country ? `${session.city}, ${session.country}` : session.country) || "Location unavailable";
            const deviceName = session.deviceType && session.deviceType !== "unknown" ? session.deviceType.charAt(0).toUpperCase() + session.deviceType.slice(1) : "Unknown device";
            const browserName = session.browser && session.browser !== "Unknown Browser" ? session.browser : "Unknown browser";
            const osName = session.os && session.os !== "Unknown OS" ? session.os : "Unknown operating system";
            
            return (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl transition-all ${
                  isCurrent 
                    ? "bg-[#F3F4F6]/80 dark:bg-white/10 border-2 border-black/10 dark:border-white/20 shadow-sm" 
                    : "bg-white/60 dark:bg-[#0A0A0A]/60 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md"
                } backdrop-blur-xl`}
              >
                <div className="flex items-center gap-5">
                  <div className={`p-3.5 rounded-full flex-shrink-0 ${isCurrent ? 'bg-black/10 dark:bg-white/20' : 'bg-black/5 dark:bg-white/5'}`}>
                    <DeviceIcon type={session.deviceType} os={session.os} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-black dark:text-white">
                        {deviceName}
                      </h3>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          This device
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-black/60 dark:text-white/60 font-medium">
                      {browserName} <span className="mx-1.5 opacity-50">•</span> {osName}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2.5 text-xs text-black/50 dark:text-white/50 font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        {formatRelativeTime(session.lastActiveAt || session.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    disabled={revokingId === session.id}
                    className="mt-4 sm:mt-0 sm:ml-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-white dark:bg-black border border-black/10 dark:border-white/10 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {revokingId === session.id ? "Logging Out..." : "Log Out Device"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
