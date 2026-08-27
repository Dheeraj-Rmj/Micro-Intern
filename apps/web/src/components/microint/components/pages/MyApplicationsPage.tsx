"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { Application } from "../../types";
import { FileCheck, Clock, CheckCircle2, XCircle, Award, ArrowRight, Sparkles } from "lucide-react";

export const MyApplicationsPage: React.FC = () => {
 const { applications, setCurrentRoute, setActiveWorkspaceTrial, trials } = useApp();
 const [selectedStatus, setSelectedStatus] = useState<string>("All");

 const filteredApps = applications.filter(
 (a) => selectedStatus === "All" || a.status === selectedStatus.toLowerCase(),
 );

 const getStatusBadge = (status: Application["status"]) => {
 switch (status) {
 case "accepted":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white backdrop-blur-xl font-bold text-xs">
 <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
 </span>
 );
 case "shortlisted":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white backdrop-blur-xl font-bold text-xs">
 <Sparkles className="w-3.5 h-3.5" /> Workspace Ready
 </span>
 );
 case "applied":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-xl/10 text-black/60 font-bold text-xs">
 <Clock className="w-3.5 h-3.5" /> Under Review
 </span>
 );
 case "rejected":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 font-bold text-xs">
 <XCircle className="w-3.5 h-3.5" /> Not Selected
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-xl/10 text-black/60 font-bold text-xs">
 <Clock className="w-3.5 h-3.5" /> {status}
 </span>
 );
 }
 };

 return (
 <div className="pb-12 text-[#222] max-w-[1200px] mx-auto w-full font-sans">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 mt-4">
 <div>
 <div className="flex items-center gap-3 text-black/40 text-sm font-semibold mb-2">
 <span className="flex items-center gap-1.5">
 <FileCheck className="w-4 h-4" /> Application Tracking
 </span>
 </div>
 <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#222]">
 My Applications
 </h1>
 </div>

 {/* Quick Filter Tabs */}
 <div className="flex items-center gap-2 p-1.5 bg-black/5 A0A0A] rounded-full overflow-x-auto border border-white/50 shadow-sm">
 {["All", "Shortlisted", "Applied", "Accepted", "Rejected"].map((status) => (
 <button
 key={status}
 onClick={() => setSelectedStatus(status)}
 className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
 selectedStatus === status
 ? "bg-[#111111] text-white backdrop-blur-xl shadow-sm"
 : "text-black/40 hover:text-black :text-white"
 }`}
 >
 {status}
 </button>
 ))}
 </div>
 </div>

 {/* Applications List */}
 {filteredApps.length === 0 ? (
 <div className="py-24 px-6 text-center rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50">
 <div className="w-16 h-16 rounded-full bg-black/5 backdrop-blur-xl/5 text-[#222] flex items-center justify-center mx-auto mb-6">
 <FileCheck className="w-6 h-6" />
 </div>
 <h3 className="text-2xl tracking-tight text-[#222] font-serif">
 No applications yet
 </h3>
 <p className="text-sm text-black/50 max-w-sm mx-auto mt-2 leading-relaxed">
 You haven&apos;t submitted any applications for micro-trials. Explore available company
 trials to get started.
 </p>
 <button
 onClick={() => setCurrentRoute("discover-trials")}
 className="mt-8 px-6 py-3 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
 >
 Discover Trials <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <div className="grid gap-4">
 {filteredApps.map((app) => {
 const associatedTrial = trials.find((t) => t.id === app.trialId);
 return (
 <div
 key={app.id}
 className="p-6 md:p-8 rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
 >
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
 {app.company}
 </span>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 backdrop-blur-xl/5 text-black/40 ">
 Applied {app.appliedDate}
 </span>
 </div>

 <h3 className="text-2xl tracking-tight font-serif text-[#222] leading-tight">
 {app.trialTitle}
 </h3>

 <p className="text-sm text-black/60 font-medium flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[#111111] backdrop-blur-xl" /> Stage:{" "}
 {app.stage}
 </p>
 </div>

 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-white/50">
 <div className="text-left md:text-right">
 <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
 Match Score
 </p>
 <p className="text-2xl font-light tracking-tight text-[#222]">
 {app.matchScore}%
 </p>
 </div>

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
 {getStatusBadge(app.status)}

 {(app.status === "shortlisted" || app.status === "applied") && (
 <button
 onClick={() => {
 if (associatedTrial) setActiveWorkspaceTrial(associatedTrial);
 setCurrentRoute("workspace");
 }}
 className="px-6 py-2.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
 >
 <span>Workspace</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
};
