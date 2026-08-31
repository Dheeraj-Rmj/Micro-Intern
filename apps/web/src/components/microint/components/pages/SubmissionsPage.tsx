"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { submissionsApi, Submission as ApiSubmission } from "../../../../lib/api/submissions";
import { learningApi, LearningRecommendationResult } from "../../../../lib/api/learning";
import { Submission as AppContextSubmission } from "../../types";
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
 BookOpen,
 Target,
 ArrowRight
} from "lucide-react";

 export const SubmissionsPage: React.FC = () => {
  const { trials } = useApp();
  const [realSubmissions, setRealSubmissions] = useState<ApiSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [learningResult, setLearningResult] = useState<LearningRecommendationResult | null>(null);
  
  React.useEffect(() => {
    const loadSubs = async () => {
      try {
        const [subsRes, learningRes] = await Promise.all([
          submissionsApi.listMySubmissions().catch(() => ({ data: [] })),
          learningApi.getRecommendations().catch(() => null)
        ]);
        setRealSubmissions(subsRes.data || []);
        if (learningRes) setLearningResult(learningRes);
      } catch (err) {
        console.error(err);
      }
    };
    loadSubs();
  }, []);

 const getStatusBadge = (status: string) => {
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
 <span>Total Submitted: {realSubmissions.length}</span>
 </div>
 </div>

 {/* Learning Path Recommendations */}
 {learningResult && learningResult.missingSkills.length > 0 && (
    <div className="mb-12 p-8 rounded-[40px] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500 rounded-2xl text-white">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-[#222] dark:text-white">Your Learning Path</h2>
          <p className="text-sm text-black/60 dark:text-white/60">Based on your recent skill verifications</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Skills to Master
          </h3>
          <div className="space-y-3">
            {learningResult.missingSkills.map(skill => (
              <div key={skill.skillId} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10">
                <span className="font-bold text-sm text-[#222] dark:text-white">{skill.skillName}</span>
                <span className="text-xs font-mono px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-black/60 dark:text-white/60">
                  Target: {skill.targetScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
            Recommended Resources
          </h3>
          <div className="space-y-3">
            {learningResult.recommendedResources.map((res, i) => (
              <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 hover:border-indigo-300 transition-colors group">
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{res.type.replace("_", " ")}</span>
                  <p className="font-bold text-sm text-[#222] dark:text-white mt-0.5">{res.title}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-black/20 dark:text-white/20 group-hover:text-indigo-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}

 {/* Submissions List */}
 {realSubmissions.length === 0 ? (
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
 {realSubmissions.map((sub) => {
 const trial = trials.find((t) => t.id === sub.assessmentId);
 const details = sub.evaluation?.details || {};
 const mappedSub = {
   ...sub,
   score: sub.evaluation?.score,
   performanceClassification: sub.evaluation?.performanceClassification,
   aiSummary: sub.evaluation?.aiSummary,
    strengths: (details as any).strengths || [],
    improvements: (details as any).improvements || [],
    learningRecommendations: (details as any).learningRecommendations || [],
    feedback: (details as any).feedback
 };
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
 Submitted {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
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
 {mappedSub.score !== undefined && (
 <div className="text-right">
 <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
 Evaluation Score
 </p>
 <p className="text-2xl font-light tracking-tight text-[#222]">
 {mappedSub.score}%
 </p>
 </div>
 )}

 <div className="flex items-center gap-3">
 {getStatusBadge(sub.status)}

 <button
 onClick={() => setSelectedSub(mappedSub)}
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
          {selectedSub.strengths.map((s: string, i: number) => (
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
          {selectedSub.improvements.map((s: string, i: number) => (
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
        {selectedSub.learningRecommendations.map((rec: string, i: number) => (
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
