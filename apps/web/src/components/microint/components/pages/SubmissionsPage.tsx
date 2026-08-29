"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { Submission } from "../../types";
import {
 Send,
 Clock,
 CheckCircle2,
 XCircle,
 ExternalLink,
 Code2,
 AlertCircle,
 FileText,
 X,
} from "lucide-react";

export const SubmissionsPage: React.FC = () => {
 const { submissions, trials } = useApp();
 const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

 const getStatusBadge = (status: Submission["status"]) => {
 switch (status) {
 case "Evaluated":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white backdrop-blur-xl font-bold text-[11px] uppercase tracking-wider">
 <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
 </span>
 );
 case "Under Review":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-xl/10 text-black/60 font-bold text-[11px] uppercase tracking-wider">
 <Clock className="w-3.5 h-3.5" /> Under Review
 </span>
 );
 case "Approved":
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white backdrop-blur-xl font-bold text-[11px] uppercase tracking-wider">
 <CheckCircle2 className="w-3.5 h-3.5" /> Approved
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-xl/10 text-black/60 font-bold text-[11px] uppercase tracking-wider">
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
 <Send className="w-4 h-4" /> Deliverables
 </span>
 </div>
 <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#222]">
 Submissions
 </h1>
 </div>

 <div className="px-6 py-3 rounded-full bg-black/5 A0A0A] border border-white/50 shadow-sm text-black/60 font-bold text-sm flex items-center gap-2">
 <span>Total Submitted: {submissions.length}</span>
 </div>
 </div>

 {/* Submissions List */}
 {submissions.length === 0 ? (
 <div className="py-24 px-6 text-center rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl shadow-sm border border-white/50">
 <Send className="w-12 h-12 text-black/20 mx-auto mb-4" />
 <h3 className="text-2xl font-serif text-[#222]">No submissions yet</h3>
 <p className="text-sm text-black/50 max-w-sm mx-auto mt-2 leading-relaxed">
 When you complete tasks inside an active skill trial workspace and submit your code,
 they will appear here.
 </p>
 </div>
 ) : (
 <div className="grid gap-4">
 {submissions.map((sub) => {
 const trial = trials.find((t) => t.id === sub.trialId);
 return (
 <div
 key={sub.id}
 className="p-6 md:p-8 rounded-[40px] bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
 >
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
 {trial?.company || "Company"}
 </span>
 <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-black/5 backdrop-blur-xl/5 text-black/50 ">
 Submitted {sub.submittedAt}
 </span>
 </div>

 <h3 className="text-2xl font-serif text-[#222]">
 {trial?.title || "Trial Deliverable"}
 </h3>

 {sub.repoUrl && (
 <a
 href={sub.repoUrl}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 text-xs text-black/60 hover:text-black :text-white transition-colors"
 >
 <Code2 className="w-3.5 h-3.5" />
 <span>{sub.repoUrl}</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 )}
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/50">
 {sub.score !== undefined && (
 <div className="text-right">
 <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
 Evaluation Score
 </p>
 <p className="text-2xl font-light tracking-tight text-[#222]">
 {sub.score}%
 </p>
 </div>
 )}

 <div className="flex items-center gap-3">
 {getStatusBadge(sub.status)}

 <button
 onClick={() => setSelectedSub(sub)}
 className="px-6 py-2.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer"
 >
 View Details
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Submission Details Modal */}
 {selectedSub && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setSelectedSub(null)}
 />
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 rounded-[40px] max-w-lg w-full p-8 shadow-2xl relative z-10 text-[#222]">
 <button
 onClick={() => setSelectedSub(null)}
 className="absolute right-6 top-6 w-10 h-10 rounded-full bg-black/5 backdrop-blur-xl/5 flex items-center justify-center text-[#666] hover:text-black :text-white cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>

 <span className="text-xs font-bold text-black/40 uppercase tracking-widest block mb-2">
 Submission Report
 </span>
 <h3 className="text-2xl font-serif text-[#222] mb-6">
 Evaluation Details
 </h3>

  <div className="space-y-4 mb-8">
  <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div>
      <span className="text-sm font-semibold text-black/60 ">
        Automated Score
      </span>
      <p className="font-bold text-2xl text-[#222]">
        {selectedSub.score !== undefined ? `${selectedSub.score}%` : "Pending"}
      </p>
    </div>
    {selectedSub.performanceClassification && (
      <div>
        <span className="text-sm font-semibold text-black/60 block mb-1">
          Performance
        </span>
        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-sm">
          {selectedSub.performanceClassification}
        </span>
      </div>
    )}
  </div>

  {selectedSub.aiSummary && (
    <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5">
      <span className="text-xs font-bold text-black/40 uppercase tracking-widest block mb-1">
        AI Evaluation Summary
      </span>
      <p className="text-sm text-black/80 leading-relaxed">
        {selectedSub.aiSummary}
      </p>
    </div>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {selectedSub.strengths && selectedSub.strengths.length > 0 && (
      <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">
          Strengths
        </span>
        <ul className="space-y-1.5">
          {selectedSub.strengths.map((s, i) => (
            <li key={i} className="text-sm text-black/80 flex gap-2">
              <span className="text-emerald-500">•</span> {s}
            </li>
          ))}
        </ul>
      </div>
    )}
    
    {selectedSub.improvements && selectedSub.improvements.length > 0 && (
      <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
          Areas to Improve
        </span>
        <ul className="space-y-1.5">
          {selectedSub.improvements.map((s, i) => (
            <li key={i} className="text-sm text-black/80 flex gap-2">
              <span className="text-amber-500">•</span> {s}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

  {selectedSub.learningRecommendations && selectedSub.learningRecommendations.length > 0 && (
    <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5">
      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
        Learning Recommendations
      </span>
      <ul className="space-y-1.5">
        {selectedSub.learningRecommendations.map((rec, i) => (
          <li key={i} className="text-sm text-black/80 flex gap-2">
            <span className="text-indigo-500">•</span> {rec}
          </li>
        ))}
      </ul>
    </div>
  )}

  {selectedSub.feedback && !selectedSub.aiSummary && (
  <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5">
  <span className="text-xs font-bold text-black/40 uppercase tracking-widest block mb-1">
  Feedback Note
  </span>
  <p className="text-sm text-black/80 leading-relaxed">
  {selectedSub.feedback}
  </p>
  </div>
  )}
  </div>

 <button
 onClick={() => setSelectedSub(null)}
 className="w-full py-3.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer"
 >
 Close
 </button>
 </div>
 </div>
 )}
 </div>
 );
};
