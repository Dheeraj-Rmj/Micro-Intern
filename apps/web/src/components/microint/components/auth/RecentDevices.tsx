"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "../../../../lib/api/client";
import { Laptop, Smartphone, MapPin, Clock, XCircle, ShieldAlert } from "lucide-react";

export const RecentDevices = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await apiClient.get<{ data: any[] }>("/auth/sessions");
      setSessions(response.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      fetchSessions();
    } catch (err) {
      console.error("Failed to revoke session", err);
    }
  };

  if (loading) return <div className="text-white">Loading recent devices...</div>;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-white max-w-3xl w-full">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <ShieldAlert className="w-6 h-6 text-rose-500" />
        <div>
          <h2 className="text-xl font-semibold">Where you&apos;re logged in</h2>
          <p className="text-sm text-gray-400">Review your recent active sessions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const isMobile = session.deviceType === "mobile";
          return (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-full">
                  {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {session.os || "Unknown OS"} • {session.browser || "Unknown Browser"}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {session.city && session.country
                        ? `${session.city}, ${session.country}`
                        : "Unknown Location"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => revokeSession(session.id)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                Log Out
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
