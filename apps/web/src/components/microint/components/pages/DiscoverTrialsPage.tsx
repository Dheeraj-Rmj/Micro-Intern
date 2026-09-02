"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { Trial } from "../../types";
import {
 Search,
 Bookmark,
 Clock,
 Award,
 Users,
 Filter,
 X,
 CheckCircle2,
 Sparkles,
 ArrowRight,
 ChevronRight,
  Building2,
} from "lucide-react";

export const DiscoverTrialsPage: React.FC = () => {
 const {
 trials,
 toggleBookmark,
 applyForTrial,
 setActiveWorkspaceTrial,
 setCurrentRoute,
 searchQuery,
 setSearchQuery,
 refreshTrials,
 } = useApp();

 React.useEffect(() => {
   refreshTrials();
 }, [refreshTrials]);

 const [selectedCategory, setSelectedCategory] = useState<string>("All");
 const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
 const [activeModalTrial, setActiveModalTrial] = useState<Trial | null>(null);

 const categories = [
 "All",
 "Frontend",
 "AI / ML",
 "Backend",
 "UI/UX Design",
 "Full Stack",
 "DevOps",
 ];
 const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

 const filteredTrials = trials.filter((t) => {
 const matchesSearch =
 t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
 const matchesDifficulty = selectedDifficulty === "All" || t.difficulty === selectedDifficulty;

 return matchesSearch && matchesCategory && matchesDifficulty;
 });

 return (
 <div className="pb-12 text-[#222] max-w-[1200px] mx-auto w-full font-sans">
 {/* Header Title */}
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
 <div>
 <div className="flex items-center gap-3 text-black/40 text-sm font-semibold mb-2">
 <span className="flex items-center gap-1.5">
 <Sparkles className="w-4 h-4" /> Paid Trials
 </span>
 </div>
 <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#222]">
 Discover Skill Trials
 </h1>
 </div>
 </div>

 {/* Search & Filter Bar */}
 <div className="p-4 rounded-[32px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50 mb-8 flex flex-col md:flex-row gap-4 items-center">
 <div className="relative flex-1 w-full">
 <Search className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search trials by role, company, or skill..."
 className="w-full pl-12 pr-4 py-3.5 rounded-full bg-black/5 backdrop-blur-xl/5 border border-transparent text-sm focus:outline-none focus:border-black/10 :border-white/10 text-[#222] placeholder:text-black/40 :text-white/40"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery("")}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black :text-white cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Category Filters */}
 <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
 {categories.slice(0, 4).map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 selectedCategory === cat
 ? "bg-[#111111] backdrop-blur-xl text-white shadow-sm"
 : "bg-black/5 backdrop-blur-xl/5 text-[#666] hover:bg-black/10 :bg-white/60 backdrop-blur-xl/10"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Trials Grid */}
 {filteredTrials.length === 0 ? (
 <div className="py-24 px-6 text-center rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50">
 <div className="w-16 h-16 rounded-full bg-black/5 backdrop-blur-xl/5 text-[#222] flex items-center justify-center mx-auto mb-6">
 <Search className="w-6 h-6" />
 </div>
 <h3 className="text-2xl tracking-tight text-[#222] font-serif">
 No matching trials
 </h3>
 <p className="text-sm text-black/50 max-w-sm mx-auto mt-2 leading-relaxed">
 We could not find any skill trials matching your search or filters. Try resetting your
 query.
 </p>
 <button
 onClick={() => {
 setSearchQuery("");
 setSelectedCategory("All");
 setSelectedDifficulty("All");
 }}
 className="mt-8 px-6 py-3 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
 >
 Reset Filters
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredTrials.map((trial) => {
 const isBookmarked = trial.isBookmarked;
 return (
 <div
 key={trial.id}
 className="group rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50 p-8 flex flex-col justify-between hover:shadow-lg transition-all"
 >
 <div>
 {/* Top row: Company + Bookmark */}
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
 {trial.company}
 </span>
 <button
 onClick={() => toggleBookmark(trial.id)}
 className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
 isBookmarked
 ? "bg-[#111111] backdrop-blur-xl text-white "
 : "bg-black/5 backdrop-blur-xl/5 text-black/40 hover:text-black :text-white"
 }`}
 >
 <Bookmark className="w-4 h-4 fill-current" />
 </button>
 </div>

 <h3 className="text-2xl tracking-tight font-serif text-[#222] mb-3 leading-snug">
 {trial.title}
 </h3>

 <p className="text-xs text-black/60 line-clamp-2 leading-relaxed mb-6">
 {trial.description}
 </p>

 {/* Skills tags */}
 <div className="flex flex-wrap gap-1.5 mb-6">
 {trial.skillsRequired.slice(0, 3).map((skill) => (
 <span
 key={skill}
 className="px-3 py-1 rounded-full bg-black/5 backdrop-blur-xl/5 text-[10px] font-bold text-black/60 uppercase tracking-wider"
 >
 {skill}
 </span>
 ))}
 </div>
 </div>

 <div>
 {/* Footer stats */}
 <div className="flex items-center justify-between pt-4 border-t border-white/50 text-xs font-medium text-[#666] mb-6">
 <span className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5" /> {trial.duration}
 </span>
 <span className="flex items-center gap-1.5 font-bold text-[#222]">
 <Award className="w-3.5 h-3.5 text-[#222]" /> {trial.stipend}
 </span>
 </div>

 <button
 onClick={() => setActiveModalTrial(trial)}
 className="w-full py-3.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
 >
 <span>View Brief & Apply</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Trial Brief Modal */}
  {activeModalTrial && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-md"
      onClick={() => setActiveModalTrial(null)}
    />
    <div className="bg-[#1C1D1F] border border-white/10 rounded-[20px] max-w-[800px] w-full shadow-2xl relative max-h-[90vh] flex flex-col z-10 text-white overflow-hidden">
      
      {/* Header section fixed */}
      <div className="p-6 sm:px-10 sm:pt-10 pb-6 border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveModalTrial(null)}
          className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <img 
            src={activeModalTrial.logo || "https://cdn-icons-png.flaticon.com/512/25/25231.png"} 
            alt="Company Logo" 
            className="w-16 h-16 rounded-xl object-contain bg-white p-2"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {activeModalTrial.title}
            </h2>
            <div className="text-sm text-white/70 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-white">{activeModalTrial.company}</span>
              <span>•</span>
              <span>{activeModalTrial.location || "Remote"}</span>
              <span>•</span>
              <span>
                {(() => {
                  const daysAgo = activeModalTrial.publishedAt 
                    ? Math.floor((new Date().getTime() - new Date(activeModalTrial.publishedAt).getTime()) / (1000 * 3600 * 24))
                    : 0;
                  return daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
                })()}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Over {activeModalTrial.applicantsCount + 100} people clicked apply</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {activeModalTrial.workSetting || "On-site"}
          </span>
          <span className="px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {activeModalTrial.employmentType || "Internship"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              applyForTrial(activeModalTrial.id);
              setActiveWorkspaceTrial(activeModalTrial);
              setActiveModalTrial(null);
              setCurrentRoute("workspace");
            }}
            className="px-8 py-2.5 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-base transition-colors flex items-center gap-2"
          >
            <span>Apply</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleBookmark(activeModalTrial.id)}
            className="px-6 py-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white/5 text-white font-bold text-base transition-colors"
          >
            {activeModalTrial.isBookmarked ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="p-6 sm:px-10 overflow-y-auto custom-scrollbar">
        
        {/* Determine Fit Mock */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Determine your fit and how to stand out</h3>
          <p className="text-sm text-white/70 mb-4">
            Get AI-powered advice on this role and more exclusive features with MicroIntern Premium. 
            <span className="text-[#0a66c2] hover:underline cursor-pointer ml-1">Learn more</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium flex items-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-400" /> Show match details
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium flex items-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-400" /> Tailor my resume
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium flex items-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-400" /> Help me stand out
            </button>
          </div>
        </div>

        {/* About the job */}
        <div>
          <h3 className="text-xl font-bold mb-4">About the job</h3>
          <div className="text-sm text-white/80 leading-relaxed space-y-4 whitespace-pre-wrap">
            {activeModalTrial.description}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-base font-bold mb-4 text-white/90">Required Deliverables for Application</h3>
          <ul className="space-y-3">
            {[
              "Clean, documented source code or design files",
              "Brief 2-minute walkthrough recording of solution",
              "Test cases or verification checklist",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </div>
  </div>
)}
 </div>
 );
};
