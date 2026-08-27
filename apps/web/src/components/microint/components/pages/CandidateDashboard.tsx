"use client";
import React, { useState } from "react";
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
  const { userProfile, setCurrentRoute } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState<string>("devices");

  const displayName = userProfile?.fullName || "Nixtio";
  const userTitle = userProfile?.degree || "UX/UI Designer";
  const userAvatar =
    userProfile?.avatar ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop";

  const navLinks = [
    { name: "Dashboard", route: "dashboard", active: true },
    { name: "Network", route: "network", active: false },
    { name: "Discover Trials", route: "discover-trials", active: false },
    { name: "Applications", route: "my-applications", active: false },
    { name: "Workspace", route: "workspace", active: false },
    { name: "Submissions", route: "submissions", active: false },
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
                link.active
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
            <span className="text-sm font-medium text-[#444444]">Setting</span>
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

      <div className="max-w-[1600px] mx-auto px-6">
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
                  15%
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#555555]">Completed</span>
                <div className="px-6 py-2.5 rounded-full bg-[#FFD166] text-[#222] text-sm font-medium">
                  15%
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
                  10%
                </div>
              </div>
            </div>

            {/* Big Stats Right */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">78</span>
                  <span className="text-xs text-[#555555] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Users className="w-3 h-3" /> Applications
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">56</span>
                  <span className="text-xs text-[#555555] font-medium flex items-center justify-end gap-1 uppercase tracking-wider">
                    <Briefcase className="w-3 h-3" /> Interviews
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[3rem] font-light leading-none tracking-tight">203</span>
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
                <div className="px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md bg-black/20 text-white font-mono text-sm">
                  $1,200
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
            <div className="grid grid-cols-2 gap-6 h-[320px]">
              {/* Progress Card */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-medium text-[#222]">Progress</h2>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[2.5rem] font-light leading-none">6.1 h</span>
                      <span className="text-xs text-[#666] leading-tight max-w-[80px]">
                        Work Time this week
                      </span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-white transition-colors bg-white/50">
                    <ArrowUpRight className="w-5 h-5 text-[#333]" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between px-2 h-[120px]">
                  {[
                    { day: "S", height: 30, active: false },
                    { day: "M", height: 80, active: false },
                    { day: "T", height: 50, active: false },
                    { day: "W", height: 90, active: false },
                    { day: "T", height: 60, active: false },
                    { day: "F", height: 75, active: true, value: "5h 23m" },
                    { day: "S", height: 0, active: false },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 relative group">
                      {bar.active && (
                        <div className="absolute -top-10 px-3 py-1 bg-[#FFD166] text-[#222] text-xs font-medium rounded-full shadow-sm whitespace-nowrap z-10">
                          {bar.value}
                        </div>
                      )}
                      <div className="w-2.5 h-[100px] rounded-full bg-black/5 relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${
                            bar.active ? "bg-[#FFD166]" : "bg-[#333]"
                          }`}
                          style={{ height: `${bar.height}%` }}
                         />
                      </div>
                      <span className="text-[10px] font-mono font-medium text-[#888]">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Tracker Card */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="w-full flex justify-between items-start absolute top-6 left-6 right-6">
                  <h2 className="text-xl font-medium text-[#222]">Time tracker</h2>
                  <button className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-white transition-colors bg-white/50">
                    <ArrowUpRight className="w-5 h-5 text-[#333]" />
                  </button>
                </div>

                <div className="relative flex-1 flex items-center justify-center w-full mt-4">
                  <svg className="w-48 h-48 transform -rotate-90">
                    {/* Dashed background track */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth="2"
                      strokeDasharray="4 8"
                    />
                    {/* Solid yellow progress */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#FFD166"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="502"
                      strokeDashoffset="200" // Adjust this to change progress
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-light tracking-tight text-[#222]">02:35</span>
                    <span className="text-xs text-[#666]">Work Time</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#222] hover:scale-105 transition-transform"
                  >
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#222] hover:scale-105 transition-transform">
                    <Pause className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-[#333] text-white shadow-sm flex items-center justify-center hover:scale-105 transition-transform ml-4">
                    <Clock className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm flex-1 relative overflow-hidden flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-xs font-medium">August</span>
                <h3 className="text-lg font-medium text-[#222]">September 2024</h3>
                <span className="px-4 py-1.5 rounded-full bg-white shadow-sm text-xs font-medium">October</span>
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
                  <div className="flex-1 relative flex justify-between px-8">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-px h-full bg-black/5 border-l border-black/5 border-dashed" />
                    ))}

                    {/* Event Block 1 */}
                    <div className="absolute top-[10%] left-[25%] w-[40%] bg-[#333] text-white rounded-2xl p-4 shadow-lg z-10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Weekly Team Sync</h4>
                        <p className="text-xs text-white/60 mt-0.5">Discuss progress on projects</p>
                      </div>
                      <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/100?img=1" className="w-6 h-6 rounded-full border border-[#333]" alt="" />
                        <img src="https://i.pravatar.cc/100?img=2" className="w-6 h-6 rounded-full border border-[#333]" alt="" />
                        <img src="https://i.pravatar.cc/100?img=3" className="w-6 h-6 rounded-full border border-[#333]" alt="" />
                      </div>
                    </div>

                    {/* Event Block 2 */}
                    <div className="absolute top-[60%] left-[45%] w-[35%] bg-white rounded-2xl p-4 shadow-md z-10 flex items-center justify-between border border-black/5">
                      <div>
                        <h4 className="text-sm font-medium text-[#222]">Onboarding Session</h4>
                        <p className="text-xs text-[#666] mt-0.5">Introduction for new hires</p>
                      </div>
                      <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/100?img=4" className="w-6 h-6 rounded-full border border-white" alt="" />
                        <img src="https://i.pravatar.cc/100?img=5" className="w-6 h-6 rounded-full border border-white" alt="" />
                      </div>
                    </div>
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
                <h2 className="text-lg font-medium">Onboarding Task</h2>
                <span className="text-3xl font-light text-white/90">2/8</span>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <TaskItem
                  title="Interview"
                  time="Sep 13, 08:30"
                  icon={<Monitor className="w-4 h-4" />}
                  completed
                />
                <TaskItem
                  title="Team Meeting"
                  time="Sep 13, 10:30"
                  icon={<Users className="w-4 h-4" />}
                  completed
                />
                <TaskItem
                  title="Project Update"
                  time="Sep 13, 13:00"
                  icon={<div className="w-4 h-4 border-2 border-current rounded-sm" />}
                  completed={false}
                />
                <TaskItem
                  title="Discuss Q3 Goals"
                  time="Sep 13, 14:45"
                  icon={<Briefcase className="w-4 h-4" />}
                  completed={false}
                />
                <TaskItem
                  title="HR Policy Review"
                  time="Sep 13, 16:30"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  completed={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <h4 className={`text-sm font-medium truncate ${completed ? "text-white/60 line-through decoration-white/30" : "text-white"}`}>
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
