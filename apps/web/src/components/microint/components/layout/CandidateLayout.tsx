"use client";
import React, { ReactNode } from "react";
import { useApp } from "../../context/AppContext";
import { Bell, Settings } from "lucide-react";

interface CandidateLayoutProps {
  children: ReactNode;
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
  const { currentRoute, setCurrentRoute, userProfile } = useApp();

  const userAvatar =
    userProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.fullName || "User")}&background=random`;

  const navLinks = [
    { name: "Dashboard", route: "dashboard" },
    { name: "Network", route: "network" },
    { name: "Discover Trials", route: "discover-trials" },
    { name: "Applications", route: "my-applications" },
    { name: "Workspace", route: "workspace" },
    { name: "Submissions", route: "submissions" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4DB] via-[#F4F1EA] to-[#F1E8D2] text-[#222222] font-sans overflow-x-hidden selection:bg-[#222222] selection:text-white pb-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="px-5 py-2 rounded-full border border-black/20 bg-transparent flex items-center justify-center">
            <span className="font-serif text-xl font-medium tracking-tight">MicroIntern</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-transparent">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => setCurrentRoute(link.route as any)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                currentRoute === link.route
                  ? "bg-[#333333] text-white shadow-lg"
                  : "text-[#444444] hover:bg-black/5"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/60 transition-colors">
            <Settings className="w-4 h-4 text-[#444444]" />
            <span className="text-sm font-medium text-[#444444] hidden sm:inline">Setting</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center hover:bg-white/60 transition-colors relative">
            <Bell className="w-4 h-4 text-[#444444]" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FFD166] rounded-full border border-[#F4F1EA]" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center hover:bg-white/60 transition-colors overflow-hidden">
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-6">
        {children}
      </div>
    </div>
  );
};
