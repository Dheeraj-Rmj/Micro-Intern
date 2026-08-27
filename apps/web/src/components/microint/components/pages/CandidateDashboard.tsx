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
} from "lucide-react";

export const CandidateDashboard: React.FC = () => {
  const { userProfile, setCurrentRoute, applications, interviews, submissions } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("");
  const [expandedAccordion, setExpandedAccordion] = useState<string>("devices");

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

  return (
    <>
      {/* Header Section */}
        <div className="mt-4 mb-10 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
          <div>
            <h1 className="text-[3.5rem] leading-none font-serif tracking-tight text-[#111111]">
              Welcome in, {displayName.split(" ")[0]}
            </h1>
          </div>

          <div className="flex items-end gap-16 w-full xl:w-auto">
            {/* Stats Left */}
            <div className="flex items-center gap-6 flex-1 xl:flex-none">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555]">Active</span>
                <div className="px-6 py-2.5 rounded-full bg-[#333333] text-white text-sm font-medium">
                  {applications.filter(a => a.status === "applied" || a.status === "interviewing").length * 10}%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555]">Completed</span>
                <div className="px-6 py-2.5 rounded-full bg-[#FFD166] text-[#222] text-sm font-medium">
                  {submissions.filter(s => s.status === "Evaluated" || s.status === "Approved").length * 10}%
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                <span className="text-sm text-[#555555]">Escrow time</span>
                <div className="h-[40px] rounded-full overflow-hidden flex relative border border-black/10">
                  <div className="w-[60%] bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.03)_4px,rgba(0,0,0,0.03)_8px)] bg-white/50 backdrop-blur-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555]">Output</span>
                <div className="px-6 py-2.5 rounded-full border border-black/20 text-[#222] text-sm font-medium bg-transparent">
                  {submissions.length * 10}%
                </div>
              </div>
            </div>

            {/* Big Stats Right */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{applications.length}</span>
                  <span className="text-xs text-[#555555] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Users className="w-3 h-3" /> Applications
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{interviews.length}</span>
                  <span className="text-xs text-[#555555] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Briefcase className="w-3 h-3" /> Interviews
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">{submissions.length}</span>
                  <span className="text-xs text-[#555555] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
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
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-serif text-white tracking-tight">{displayName}</h3>
                  <p className="text-white/70 text-sm">{userTitle}</p>
                </div>

              </div>
            </div>

            {/* Accordion Menu */}
            <div className="flex flex-col gap-2">
              <AccordionItem
                title="Pension contributions"
                id="pension"
                expanded={expandedAccordion}
                setExpanded={setExpandedAccordion}
              />
              <AccordionItem
                title="Devices"
                id="devices"
                expanded={expandedAccordion}
                setExpanded={setExpandedAccordion}
              >
                <div className="flex items-center justify-between py-3 px-4 bg-white/40 rounded-xl mt-2 backdrop-blur-sm border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center overflow-hidden">
                      <Monitor className="w-5 h-5 text-[#333]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#222]">MacBook Air</p>
                      <p className="text-xs text-[#666]">Version M1</p>
                    </div>
                  </div>
                  <button className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-1 h-1 bg-[#666] rounded-full" />
                      <div className="w-1 h-1 bg-[#666] rounded-full" />
                      <div className="w-1 h-1 bg-[#666] rounded-full" />
                    </div>
                  </button>
                </div>
              </AccordionItem>
              <AccordionItem
                title="Compensation Summary"
                id="comp"
                expanded={expandedAccordion}
                setExpanded={setExpandedAccordion}
              />
              <AccordionItem
                title="Employee Benefits"
                id="benefits"
                expanded={expandedAccordion}
                setExpanded={setExpandedAccordion}
              />
            </div>
          </div>

          {/* Middle Content */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 h-[320px]">
              {/* Time Tracker Card */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="w-full flex justify-between items-start absolute top-6 left-6 right-6">
                  <h2 className="text-xl font-medium text-[#222]">Time tracker</h2>
                  <button className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-white transition-colors bg-white/50">
                    <ArrowUpRight className="w-5 h-5 text-[#333]" />
                  </button>
                </div>

                <div className="relative flex-1 flex items-center justify-center w-full mt-10">
                  <svg className="w-48 h-48 transform -rotate-90">
                    {/* Subtle background track */}
                    <circle
                      cx="96"
                      cy="96"
                      r="86"
                      fill="none"
                      stroke="rgba(0,0,0,0.05)"
                      strokeWidth="6"
                    />
                    {/* Solid orange progress (Apple Timer Style) */}
                    <circle
                      cx="96"
                      cy="96"
                      r="86"
                      fill="none"
                      stroke="#FF9500"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="540"
                      strokeDashoffset={540 - (540 * (elapsedSeconds % 3600)) / 3600}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    {isEditingTimer ? (
                      <input
                        type="number"
                        className="w-28 bg-transparent border-b border-[#222] text-center text-5xl font-light tracking-tight text-[#222] outline-none mb-1 font-mono"
                        value={inputMinutes}
                        onChange={(e) => setInputMinutes(e.target.value)}
                        onBlur={handleTimerSubmit}
                        onKeyDown={(e) => e.key === "Enter" && handleTimerSubmit()}
                        autoFocus
                        placeholder="Mins"
                      />
                    ) : (
                      <span
                        className={`text-5xl font-light tracking-tight text-[#222] font-mono ${!isPlaying ? 'cursor-pointer hover:opacity-70' : ''}`}
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
                  </div>
                </div>

                <div className="flex w-full items-center justify-between px-6 pb-2">
                  <button 
                    onClick={() => {
                      setIsPlaying(false);
                      setElapsedSeconds(0);
                    }}
                    className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-[#222] font-medium text-sm hover:bg-black/10 transition-colors"
                  >
                    Reset
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-medium text-sm hover:bg-emerald-500/20 transition-colors"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center font-medium text-sm hover:bg-orange-500/20 transition-colors"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm flex-1 relative overflow-hidden flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-xs font-medium">
                  August
                </span>
                <h3 className="text-lg font-medium text-[#222]">September 2024</h3>
                <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-xs font-medium">
                  October
                </span>
              </div>

              <div className="flex-1 flex">
                {/* Time Axis */}
                <div className="flex flex-col justify-between py-12 pr-4 w-20 text-xs text-[#888] font-mono border-r border-black/5 border-dashed">
                  <span>8:00 am</span>
                  <span>9:00 am</span>
                  <span>10:00 am</span>
                  <span>11:00 am</span>
                </div>

                {/* Days Axis & Timeline Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between px-4 pb-4">
                    {[
                      { d: "Mon", n: "22" },
                      { d: "Tue", n: "23" },
                      { d: "Wed", n: "24" },
                      { d: "Thu", n: "25" },
                      { d: "Fri", n: "26" },
                      { d: "Sat", n: "27" },
                    ].map((day, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-[#888]">{day.d}</span>
                        <span className="text-sm font-medium text-[#222]">{day.n}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Grid */}
                  <div className="flex-1 relative flex justify-between px-8 py-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-px h-full bg-black/5 border-l border-black/5 border-dashed"
                      />
                    ))}

                    {/* Dynamic Event Blocks */}
                    {interviews.length > 0 ? (
                      interviews.slice(0, 3).map((interview, idx) => (
                        <div
                          key={interview.id}
                          className={`absolute w-[40%] rounded-2xl p-4 shadow-sm z-10 flex flex-col gap-2 ${
                            idx % 2 === 0
                              ? "bg-[#333] text-white shadow-lg"
                              : "bg-white border border-black/5 text-[#222]"
                          }`}
                          style={{
                            top: `${10 + idx * 30}%`,
                            left: `${15 + idx * 20}%`,
                          }}
                        >
                          <div>
                            <h4 className={`text-sm font-medium ${idx % 2 === 0 ? "text-white" : "text-[#222]"}`}>
                              {interview.trialTitle}
                            </h4>
                            <p className={`text-xs mt-0.5 ${idx % 2 === 0 ? "text-white/60" : "text-[#666]"}`}>
                              {interview.time} - {interview.interviewer}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-[#888]">No upcoming events</p>
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
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#222]">Onboarding</h2>
                <span className="text-2xl font-light text-[#222]">18%</span>
              </div>
              <div className="flex gap-2 w-full h-8">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888]">30%</span>
                  <div className="h-full bg-[#FFD166] rounded-l-full w-full flex items-center px-3">
                    <span className="text-xs font-medium text-[#222]">Task</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888]">25%</span>
                  <div className="h-full bg-[#333] w-full rounded-r-sm" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#888]">0%</span>
                  <div className="h-full bg-black/10 rounded-r-full w-full" />
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-[#333333] text-white rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col relative overflow-hidden">
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
    <div className="border-b border-black/10 last:border-0 py-2">
      <button
        onClick={() => setExpanded(isExpanded ? "" : id)}
        className="w-full flex items-center justify-between py-2 text-left group"
      >
        <span className="text-sm font-medium text-[#222] group-hover:text-black transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#888] transition-transform duration-300 ${
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
            <CheckCircle2 className="w-3.5 h-3.5 text-[#333]" />
          </div>
        ) : (
          <Circle className="w-5 h-5 text-white/20" />
        )}
      </div>
    </div>
  );
};
