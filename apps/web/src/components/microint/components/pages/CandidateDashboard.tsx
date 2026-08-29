"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Bell,
  Settings,
  ArrowUpRight,
  Play,
  Pause,
  Clock,
  ChevronDown,
  Monitor,
  CheckCircle2,
  Circle,
  Briefcase,
  Users,
  FolderKanban,
  Plus,
  X,
  Send,
  LogOut,
} from "lucide-react";
import { InterviewSlot } from "../../types";
import { authService } from "../../../../features/auth/services/auth.service";
import { useAuthStore } from "../../../../stores/auth.store";

export const CandidateDashboard: React.FC = () => {
  const { userProfile, setCurrentRoute, applications, interviews, submissions, scheduleInterview } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("");
  const [expandedAccordion, setExpandedAccordion] = useState<string>("devices");

  // Event Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<InterviewSlot | null>(null);
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", notes: "" });


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTimerSubmit = () => {
    const mins = parseInt(inputMinutes);
    if (!isNaN(mins) && mins >= 0) {
      setElapsedSeconds(mins * 60);
    }
    setIsEditingTimer(false);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const displayName = userProfile?.fullName || "User";
  const userTitle = userProfile?.degree || "Candidate";
  const userAvatar =
    userProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.fullName || "User")}&background=random`;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      localStorage.removeItem("microintern_current_route");
    }
    setCurrentRoute("landing");
  };

  return (
    <>
      {/* Header Section */}
        <div className="mt-4 mb-10 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
          <div>
            <h1 className="text-[3.5rem] leading-none font-serif tracking-tight text-[#111111] dark:text-white">
              Welcome in, {displayName.split(" ")[0]}
            </h1>
          </div>

          <div className="flex items-end gap-16 w-full xl:w-auto">
            {/* Stats Left */}
            <div className="flex items-center gap-6 flex-1 xl:flex-none">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555] dark:text-[#AAAAAA]">Active</span>
                <div className="px-6 py-2.5 rounded-full bg-[#333333] dark:bg-[#222222] text-white text-sm font-medium">
                  {applications.filter(a => a.status === "applied" || a.status === "interviewing").length * 10}%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555] dark:text-[#AAAAAA]">Completed</span>
                <div className="px-6 py-2.5 rounded-full bg-[#FFD166] dark:bg-[#FFD166] text-[#222] text-sm font-medium">
                  {submissions.filter(s => s.status === "Evaluated" || s.status === "Approved").length * 10}%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555] dark:text-[#AAAAAA]">Output</span>
                <div className="px-6 py-2.5 rounded-full border border-black/20 dark:border-white/20 text-[#222] dark:text-white text-sm font-medium bg-transparent">
                  {submissions.length * 10}%
                </div>
              </div>
            </div>

            {/* Big Stats Right */}
            <div className="flex items-center gap-8 text-[#111111] dark:text-white">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{applications.length}</span>
                  <span className="text-xs text-[#555555] dark:text-[#AAAAAA] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Users className="w-3 h-3" /> Applications
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{interviews.length}</span>
                  <span className="text-xs text-[#555555] dark:text-[#AAAAAA] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Briefcase className="w-3 h-3" /> Interviews
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{submissions.length}</span>
                  <span className="text-xs text-[#555555] dark:text-[#AAAAAA] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <FolderKanban className="w-3 h-3" /> Submissions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column (Profile & Accordion) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            {/* Profile Image Card */}
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-black group shadow-xl">
              <img
                src={userAvatar}
                alt="Profile Large"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={handleLogout}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white backdrop-blur-md transition-all flex items-center justify-center border border-white/20 shadow-sm"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-serif text-white tracking-tight">{displayName}</h3>
                  <p className="text-white/70 text-sm">{userTitle}</p>
                </div>

              </div>
            </div>


          </div>

          {/* Middle Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 min-h-[400px]">
              {/* Time Tracker Card */}
              <div className="bg-gradient-to-br from-[#FFFDF0] to-[#FFF2CC] dark:from-[#2A2615] dark:to-[#1A180C] rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center relative overflow-hidden h-full">
                <div className="w-full flex justify-between items-start z-10">
                  <h2 className="text-[1.35rem] font-medium text-[#444] dark:text-white tracking-tight">Time tracker</h2>
                  <button className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-5 h-5 text-[#666] dark:text-white/70 font-light" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="relative flex-1 flex items-center justify-center w-full my-4">
                  <svg className="w-56 h-56 transform -rotate-90">
                    {/* Dashed background track */}
                    <circle
                      cx="112"
                      cy="112"
                      r="90"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray="4 8"
                      className="stroke-black/15 dark:stroke-white/15"
                    />
                    {/* Solid yellow progress */}
                    <circle
                      cx="112"
                      cy="112"
                      r="90"
                      fill="none"
                      stroke="#FDD15A"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 - (565.48 * (elapsedSeconds % 3600)) / 3600}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    {isEditingTimer ? (
                      <input
                        type="number"
                        className="w-32 bg-transparent border-b border-[#222] dark:border-white/50 text-center text-[2.75rem] font-light tracking-tight text-[#333] dark:text-white outline-none mb-1"
                        value={inputMinutes}
                        onChange={(e) => setInputMinutes(e.target.value)}
                        onBlur={handleTimerSubmit}
                        onKeyDown={(e) => e.key === "Enter" && handleTimerSubmit()}
                        autoFocus
                        placeholder="Mins"
                      />
                    ) : (
                      <span
                        className={`text-[2.75rem] leading-none font-light tracking-tight text-[#333] dark:text-white ${!isPlaying ? 'cursor-pointer hover:opacity-70' : ''}`}
                        onClick={() => {
                          if (!isPlaying) {
                            setInputMinutes(Math.floor(elapsedSeconds / 60).toString());
                            setIsEditingTimer(true);
                          }
                        }}
                        title={!isPlaying ? "Click to set time" : ""}
                      >
                        {formatTime(elapsedSeconds)}
                      </span>
                    )}
                    <span className="text-xs text-[#888] dark:text-white/60 font-medium mt-1 tracking-wide">Work Time</span>
                  </div>
                </div>

                <div className="flex w-full items-end justify-between mt-auto z-10">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="w-14 h-14 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-[#444] dark:text-white hover:scale-105 transition-transform"
                    >
                      <Play className="w-5 h-5 ml-1" strokeWidth={1.5} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(false)}
                      className="w-14 h-14 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-[#444] dark:text-white hover:scale-105 transition-transform"
                    >
                      <Pause className="w-5 h-5" strokeWidth={1.5} fill="currentColor" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsPlaying(false);
                      setElapsedSeconds(0);
                    }}
                    className="w-14 h-14 rounded-full bg-[#2A2A2A] dark:bg-black/40 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
                  >
                    <Clock className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] p-6 shadow-sm flex-1 relative overflow-hidden flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 rounded-full bg-white dark:bg-[#222] shadow-sm text-xs font-medium hidden sm:block dark:text-[#AAAAAA]">
                  {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString('default', { month: 'long' })}
                </span>
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium text-[#222] dark:text-white">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button 
                    onClick={() => { setSelectedEvent(null); setEventForm({ title: "", date: "", time: "", notes: "" }); setShowEventModal(true); }}
                    className="p-1.5 bg-[#222] dark:bg-white text-white dark:text-black rounded-full hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-white dark:bg-[#222] shadow-sm text-xs font-medium hidden sm:block dark:text-[#AAAAAA]">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString('default', { month: 'long' })}
                </span>
              </div>

              <div className="flex-1 flex">
                {/* Time Axis (9 AM - 5 PM) */}
                <div className="flex flex-col justify-between py-12 pr-4 w-20 text-xs text-[#888] dark:text-[#AAAAAA] font-mono border-r border-black/5 dark:border-white/5 border-dashed">
                  <span>9:00 am</span>
                  <span>11:00 am</span>
                  <span>1:00 pm</span>
                  <span>3:00 pm</span>
                  <span>5:00 pm</span>
                </div>

                {/* Days Axis & Timeline Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between px-4 pb-4">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + i;
                      const date = new Date(today.setDate(diff));
                      const d = date.toLocaleString('default', { weekday: 'short' });
                      const n = date.getDate().toString();
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-xs text-[#888] dark:text-[#AAAAAA]">{d}</span>
                          <span className={`text-sm font-medium ${new Date().getDate() === parseInt(n) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 rounded-full' : 'text-[#222] dark:text-white'}`}>{n}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timeline Grid */}
                  <div className="flex-1 relative flex justify-between px-4 py-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-full h-full border-l border-black/5 border-dashed first:border-l-0 relative"
                      />
                    ))}

                    {/* Dynamic Event Blocks */}
                    {interviews.length > 0 ? (
                      interviews.map((interview, idx) => {
                        // Position calculations
                        let hours = 9;
                        let minutes = 0;
                        if (interview.time) {
                          const timeStr = interview.time.toUpperCase();
                          if (timeStr.includes("PM") || timeStr.includes("AM")) {
                            const parts = timeStr.split(" ");
                            const timePart = parts[0] || "";
                            const periodPart = parts[1] || "";
                            const [hStr, mStr] = timePart.split(":");
                            let h = hStr ? Number(hStr) : 9;
                            let m = mStr ? Number(mStr) : 0;
                            if (periodPart === "PM" && h !== 12) h += 12;
                            if (periodPart === "AM" && h === 12) h = 0;
                            hours = h;
                            minutes = m;
                          } else {
                            const [hStr, mStr] = interview.time.split(":");
                            hours = hStr ? Number(hStr) : 9;
                            minutes = mStr ? Number(mStr) : 0;
                          }
                        }
                        
                        const eventDate = new Date(interview.date);
                        let dayIndex = eventDate.getDay() - 1;
                        if (dayIndex < 0) dayIndex = 6;
                        
                        // Only show if it fits in 9am-5pm and Mon-Sat
                        if (hours < 9 || hours >= 17 || dayIndex > 5) return null;
                        
                        const top = ((hours + minutes / 60 - 9) / 8) * 100;
                        const left = (dayIndex / 6) * 100;

                        return (
                          <div
                            key={interview.id}
                            onClick={() => { setSelectedEvent(interview); setShowEventModal(true); }}
                            className={`absolute rounded-xl p-3 shadow-sm z-10 flex flex-col gap-1 overflow-hidden transition-all hover:scale-105 hover:z-20 cursor-pointer ${
                              idx % 2 === 0
                                ? "bg-[#333] dark:bg-[#444] text-white shadow-lg"
                                : "bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 text-[#222] dark:text-white"
                            }`}
                            style={{
                              top: `${Math.max(5, Math.min(85, top))}%`,
                              left: `${left + 2}%`,
                              width: '14%',
                              minHeight: '60px'
                            }}
                          >
                            <h4 className={`text-xs font-semibold truncate ${idx % 2 === 0 ? "text-white" : "text-[#222] dark:text-white"}`}>
                              {interview.trialTitle}
                            </h4>
                            <p className={`text-[10px] mt-auto truncate ${idx % 2 === 0 ? "text-white/70" : "text-[#666] dark:text-[#AAAAAA]"}`}>
                              {interview.time}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-[#888] dark:text-[#AAAAAA]">No upcoming events this week</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Tasks) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            {/* Onboarding Mini Card */}
            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#222] dark:text-white">Onboarding</h2>
                <span className="text-2xl font-light text-[#222] dark:text-white">18%</span>
              </div>
              <div className="flex gap-2 w-full h-8">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888] dark:text-[#AAAAAA]">30%</span>
                  <div className="h-full bg-[#FFD166] rounded-l-full w-full flex items-center px-3">
                    <span className="text-xs font-medium text-[#222] dark:text-white">Task</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888] dark:text-[#AAAAAA]">25%</span>
                  <div className="h-full bg-[#333] dark:bg-[#444] w-full rounded-r-sm" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888] dark:text-[#AAAAAA]">0%</span>
                  <div className="h-full bg-black/10 dark:bg-white/10 rounded-r-full w-full" />
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-[#333333] dark:bg-[#222222] text-white rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-lg font-medium">Upcoming Events</h2>
                <span className="text-3xl font-light text-white/90">{interviews.length}</span>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                     <TaskItem
                        key={interview.id}
                        title={interview.trialTitle}
                        time={`${interview.date} ${interview.time}`}
                        icon={<Briefcase className="w-4 h-4" />}
                        completed={interview.status === "completed"}
                     />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-white/50 text-sm">
                    No upcoming events
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Dialog Modal */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowEventModal(false)}
                className="absolute top-6 right-6 text-[#888] dark:text-[#AAAAAA] hover:text-[#222] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-serif tracking-tight mb-6 text-[#111] dark:text-white">
                {selectedEvent ? "Event Details" : "Add New Event"}
              </h2>

              {selectedEvent ? (
                <div className="flex flex-col gap-4 text-sm">
                  <div>
                    <span className="text-[#888] dark:text-[#AAAAAA] block text-xs mb-1">Title</span>
                    <p className="font-medium text-[#222] dark:text-white">{selectedEvent.trialTitle}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[#888] dark:text-[#AAAAAA] block text-xs mb-1">Date</span>
                      <p className="font-medium text-[#222] dark:text-white">{selectedEvent.date}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-[#888] dark:text-[#AAAAAA] block text-xs mb-1">Time</span>
                      <p className="font-medium text-[#222] dark:text-white">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#888] dark:text-[#AAAAAA] block text-xs mb-1">Notes</span>
                    <p className="text-[#444] dark:text-gray-300 whitespace-pre-wrap">{selectedEvent.notes || "No notes provided."}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#888] dark:text-[#AAAAAA]">Event Title</label>
                    <input 
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Design Sync"
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 text-[#222] dark:text-white"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs text-[#888] dark:text-[#AAAAAA]">Date</label>
                      <input 
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 text-[#222] dark:text-white"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs text-[#888] dark:text-[#AAAAAA]">Time</label>
                      <input 
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 text-[#222] dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#888] dark:text-[#AAAAAA]">Notes (Optional)</label>
                    <textarea 
                      value={eventForm.notes}
                      onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any prep notes here..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 min-h-[80px] resize-none text-[#222] dark:text-white"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!eventForm.title || !eventForm.date || !eventForm.time) return;
                      // Format time to 12-hour AM/PM to match parsing logic
                      let [hours, mins] = eventForm.time.split(":");
                      let h = parseInt(hours || "0");
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      h = h % 12;
                      h = h ? h : 12;
                      const formattedTime = `${h}:${mins || "00"} ${ampm}`;
                      
                      scheduleInterview({
                        candidateName: userProfile?.fullName || "Candidate",
                        trialTitle: eventForm.title,
                        date: eventForm.date,
                        time: formattedTime,
                        interviewer: "N/A",
                        meetingUrl: "N/A",
                        status: "upcoming",
                        notes: eventForm.notes,
                      });
                      setShowEventModal(false);
                    }}
                    disabled={!eventForm.title || !eventForm.date || !eventForm.time}
                    className="w-full py-2.5 mt-2 bg-[#222] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Save Event
                  </button>
                </div>
              )}
            </div>
          </div>
        )}


      </>
    );
};

const AccordionItem = ({
  title,
  id,
  expanded,
  setExpanded,
  children,
}: {
  title: string;
  id: string;
  expanded: string;
  setExpanded: (id: string) => void;
  children?: React.ReactNode;
}) => {
  const isExpanded = expanded === id;
  return (
    <div className="border-b border-black/10 dark:border-white/10 last:border-0 py-2">
      <button
        onClick={() => setExpanded(isExpanded ? "" : id)}
        className="w-full flex items-center justify-between py-2 text-left group"
      >
        <span className="text-sm font-medium text-[#222] dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#888] dark:text-[#AAAAAA] transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const TaskItem = ({
  title,
  time,
  icon,
  completed,
}: {
  title: string;
  time: string;
  icon: React.ReactNode;
  completed: boolean;
}) => {
  return (
    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-medium truncate ${completed ? "text-white/60 line-through decoration-white/30" : "text-white"}`}
        >
          {title}
        </h4>
        <p className="text-xs text-white/50 truncate">{time}</p>
      </div>
      <div className="shrink-0">
        {completed ? (
          <div className="w-5 h-5 rounded-full bg-[#FFD166] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#333] dark:text-white" />
          </div>
        ) : (
          <Circle className="w-5 h-5 text-white/20" />
        )}
      </div>
    </div>
  );
};
