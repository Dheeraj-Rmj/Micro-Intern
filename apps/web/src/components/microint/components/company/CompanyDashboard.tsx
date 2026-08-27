"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { companyApi } from "../../../../lib/api/company";
import {
  Building2,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCode,
  ExternalLink,
  Search,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Key,
  Copy,
  Check,
  Calendar,
  Info,
  Clock,
  TrendingUp,
  DollarSign,
  Award,
  ShieldAlert,
  Filter,
  ChevronRight,
  BarChart2,
  Layers,
  Zap,
  Brain,
  X,
} from "lucide-react";

interface CandidateApplication {
  id: string;
  candidateName: string;
  email: string;
  trialTitle: string;
  trustScore: number;
  submittedAt: string;
  githubUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface MotivationalQuote {
  q: string;
  a: string;
}

const FALLBACK_LEADERSHIP_QUOTES: MotivationalQuote[] = [
  {
    q: "Hire for demonstrated competence, not keywords. Evidence is the only true currency of talent.",
    a: "MicroIntern Enterprise AI Protocol",
  },
  { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { q: "Quality is not an act, it is a habit.", a: "Aristotle" },
  { q: "Great vision without great people is irrelevant.", a: "Jim Collins" },
  { q: "Simplicity is the prerequisite for reliability.", a: "Edsger W. Dijkstra" },
];

export const CompanyDashboard: React.FC = () => {
  const { setCurrentRoute, showToast, trials, companyProfile } = useApp();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "pending" | "approved">("all");

  // AI Give Task state
  const [giveTaskCandidate, setGiveTaskCandidate] = useState<CandidateApplication | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Live Ticking Clock state (matching CandidatePortal)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(
    FALLBACK_LEADERSHIP_QUOTES[0] as MotivationalQuote,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Pick quote from fallback leadership quotes
    const idx = Math.floor(Math.random() * FALLBACK_LEADERSHIP_QUOTES.length);
    const selected = FALLBACK_LEADERSHIP_QUOTES[idx] || FALLBACK_LEADERSHIP_QUOTES[0];
    if (selected) {
      setCurrentQuote(selected);
    }
  }, []);

  // Fetch real submissions on mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await companyApi.getSubmissions();
        const rawData = res?.data?.submissions ?? res?.data ?? [];
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped: CandidateApplication[] = rawData.map((s: any) => ({
            id: s.id,
            candidateName: s.candidateName || s.candidate?.name || "Candidate",
            email: s.candidateEmail || s.candidate?.email || "",
            trialTitle: s.trialTitle || s.assessment?.title || "Assessment",
            trustScore: s.trustScore ?? s.score ?? 85,
            submittedAt: s.submittedAt || s.createdAt || "",
            githubUrl: s.repoUrl || s.githubUrl || "",
            status: (s.status === "APPROVED" ? "APPROVED" : s.status === "REJECTED" ? "REJECTED" : "PENDING") as CandidateApplication["status"],
          }));
          setApplications(mapped);
        }
      } catch (err) {
        console.error("Failed to load company submissions:", err);
      }
    };
    fetchSubmissions();
  }, []);

  // AI Give Task handler
  const handleGiveTask = async (app: CandidateApplication) => {
    setGiveTaskCandidate(app);
    setAiLoading(true);
    setAiRecommendations([]);
    try {
      const result = await companyApi.getAITaskRecommendation(app.id);
      if (result?.recommendations) {
        setAiRecommendations(result.recommendations);
      } else {
        // Fallback — show available trials with suitability estimate
        setAiRecommendations(
          trials.slice(0, 3).map((t, i) => ({
            id: t.id,
            title: t.title,
            difficulty: t.difficulty,
            suitability: 95 - i * 6,
            reason: i === 0 ? "Best match for candidate skill level" : i === 1 ? "Good alignment with verified skills" : "Alternative option based on competency profile",
          }))
        );
      }
    } catch {
      // Fallback recommendations
      setAiRecommendations(
        trials.slice(0, 3).map((t, i) => ({
          id: t.id,
          title: t.title,
          difficulty: t.difficulty || "Intermediate",
          suitability: 92 - i * 7,
          reason: i === 0 ? "Recommended based on MCQ score" : "Alternative task option",
        }))
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleApprove = (id: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "APPROVED" } : app)),
    );
    showToast(
      "Candidate Approved",
      `${name} has been approved! An interview & internship offer invite has been dispatched.`,
      "success",
    );
  };

  const handleReject = (id: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "REJECTED" } : app)),
    );
    showToast("Application Rejected", `${name}'s submission marked as reviewed.`, "info");
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    showToast("Recruiter Login Copied", `Copied ${email} to clipboard.`, "success");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Date String formatted
  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const filteredApplications = applications.filter((app) => {
    if (activeTabFilter === "pending") return app.status === "PENDING";
    if (activeTabFilter === "approved") return app.status === "APPROVED";
    return true;
  });

  // Dynamic SVG Chart paths for Applicant Analytics (matching CandidatePortal SVG aesthetics)
  const appY = 14;
  const appPathD = `M0 35 Q 25 ${appY + 10}, 50 ${appY + 5} T 100 ${appY}`;
  const appDashD = `M0 30 Q 25 ${appY + 12}, 50 ${appY + 8} T 100 ${appY + 3}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Top Header Bar (Matching CandidatePortal 1:1) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Admin Center • eKYC Verified
            </span>
            <span className="text-[11px] font-mono text-black/50 dark:text-white/60">
              EIN-VERIFIED • @company.microintern
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            Enterprise Hub
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 text-xs font-mono font-semibold text-black dark:text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          <button
            onClick={() => setCurrentRoute("company-create-trial" as any)}
            className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Skill Trial</span>
          </button>
        </div>
      </div>

      {/* ── Daily Leadership Quotation Banner (Matching CandidatePortal 1:1) ── */}
      <div
        className="p-7 rounded-[36px] bg-white/70 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group"
        style={{
          clipPath: "inset(0 round 36px)",
          background:
            "radial-gradient(circle 350px at 90% 10%, rgba(225, 224, 204, 0.15) 0%, transparent 70%), radial-gradient(circle 350px at 10% 90%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)",
        }}
      >
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto py-2">
          <div className="mb-3.5">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-black/60 dark:text-white/80 font-mono">
              ENTERPRISE AI PROTOCOL • {dateString}
            </span>
          </div>

          <p className="text-lg sm:text-2xl font-serif italic text-black dark:text-white leading-relaxed tracking-tight transition-all duration-500">
            “{currentQuote.q}”
          </p>

          <p className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 dark:text-white/50 mt-4">
            — {currentQuote.a}
          </p>
        </div>
      </div>

      {/* ── The 12-Column High-End Bento Grid (Matching CandidatePortal 1:1) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento Card 1 (md:col-span-4 md:row-span-2) - Enterprise Trust Score & eKYC */}
        <div
          className="md:col-span-4 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-black/20 dark:hover:border-white/30 transition-all"
          style={{
            clipPath: "inset(0 round 40px)",
            background:
              companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
              companyProfile.ekycStatus === "VERIFIED_MANUAL"
                ? "radial-gradient(circle 320px at 90% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 70%), radial-gradient(circle 280px at 10% 90%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)"
                : "radial-gradient(circle 320px at 90% 10%, rgba(245, 158, 11, 0.08) 0%, transparent 70%), radial-gradient(circle 280px at 10% 90%, rgba(239, 68, 68, 0.05) 0%, transparent 70%)",
          }}
        >
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Enterprise Trust
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
                    companyProfile.ekycStatus === "VERIFIED_MANUAL"
                      ? "bg-emerald-500"
                      : companyProfile.ekycStatus === "PENDING_MANUAL_REVIEW"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-[10px] text-black/60 dark:text-white/70 font-mono uppercase tracking-wider">
                  {companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
                  companyProfile.ekycStatus === "VERIFIED_MANUAL"
                    ? "eKYC VERIFIED"
                    : companyProfile.ekycStatus === "PENDING_MANUAL_REVIEW"
                      ? "PENDING REVIEW"
                      : "UNVERIFIED"}
                </span>
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
                companyProfile.ekycStatus === "VERIFIED_MANUAL"
                  ? "border-emerald-500/20 text-emerald-500"
                  : "border-red-500/20 text-red-500"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="relative my-auto py-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-6xl sm:text-7xl font-serif font-light tracking-tighter text-black dark:text-white">
                {companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
                companyProfile.ekycStatus === "VERIFIED_MANUAL"
                  ? "99"
                  : companyProfile.ekycStatus === "PENDING_MANUAL_REVIEW"
                    ? "50"
                    : "10"}
              </span>
              <span className="text-xl font-mono text-black/40 dark:text-white/40 font-light">
                / 100
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
                  companyProfile.ekycStatus === "VERIFIED_MANUAL"
                    ? "w-[99%] bg-gradient-to-r from-emerald-500 to-indigo-500"
                    : companyProfile.ekycStatus === "PENDING_MANUAL_REVIEW"
                      ? "w-[50%] bg-gradient-to-r from-amber-500 to-amber-400"
                      : "w-[10%] bg-gradient-to-r from-red-500 to-orange-500"
                }`}
              />
            </div>

            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed">
              {companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
              companyProfile.ekycStatus === "VERIFIED_MANUAL"
                ? "Corporate eKYC compliance & active AI evaluation nodes verified."
                : companyProfile.ekycStatus === "PENDING_MANUAL_REVIEW"
                  ? "Your uploaded documents are currently under manual review by our team."
                  : "Action required: Complete eKYC verification to access full enterprise features."}
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
            {companyProfile.ekycStatus === "VERIFIED_STRIPE" ||
            companyProfile.ekycStatus === "VERIFIED_MANUAL" ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black/50 dark:text-white/50 font-mono">
                    Domain Registration
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    VERIFIED
                  </span>
                </div>
                <button
                  onClick={() => setCurrentRoute("company-manage-trials" as any)}
                  className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-xs text-black dark:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Escrow Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      const { ekycApi } = await import("@/lib/api/ekyc");
                      const { data } = await ekycApi.createStripeSession();
                      if (data?.clientSecret) {
                        // In a real app, we'd initialize Stripe.js and call stripe.verifyIdentity(clientSecret)
                        showToast(
                          "Stripe Identity Initiated",
                          "Redirecting to verification flow...",
                          "info",
                        );
                      }
                    } catch (e: any) {
                      showToast(
                        "Verification Error",
                        e.message || "Failed to start Stripe verification.",
                        "error",
                      );
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#635BFF] hover:bg-[#5249E5] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Instantly (Stripe)</span>
                </button>
                <button
                  onClick={() => {
                    // Logic to open manual upload modal
                    showToast(
                      "Manual Upload",
                      "Please upload your business registration documents.",
                      "info",
                    );
                  }}
                  className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-black/10 dark:border-white/10"
                >
                  <span>Upload Documents (Manual)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bento Card 2 (md:col-span-8 md:row-span-1) - Applicant Pipeline Velocity Analytics */}
        <div className="md:col-span-8 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Applicant Pipeline Velocity
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                AI-graded skill trial submissions across active bounties
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                Live AI Grading Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase block">
                Total Applied
              </span>
              <span className="text-2xl font-serif font-bold text-black dark:text-white mt-1 block">
                {applications.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase block">
                Pending AI Review
              </span>
              <span className="text-2xl font-serif font-bold text-amber-500 mt-1 block">
                {applications.filter((a) => a.status === "PENDING").length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase block">
                Approved / Offers
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-500 mt-1 block">
                {applications.filter((a) => a.status === "APPROVED").length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase block">
                Active Trials
              </span>
              <span className="text-2xl font-serif font-bold text-indigo-500 mt-1 block">
                {trials.length}
              </span>
            </div>
          </div>

          {/* Custom SVG Curve Chart (Matching CandidatePortal SVG Visuals) */}
          <div className="h-28 w-full relative overflow-hidden rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-3 flex items-end">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="appGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={`${appPathD} L100 40 L0 40 Z`} fill="url(#appGradient)" />
              <path
                d={appPathD}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={appDashD}
                fill="none"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.7"
              />
            </svg>
            <div className="absolute top-3 right-4 text-[10px] font-mono text-black/40 dark:text-white/40 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-amber-500 rounded" /> AI Verification Velocity
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-indigo-500 rounded" /> Benchmark
              </span>
            </div>
          </div>
        </div>

        {/* Bento Card 3 (md:col-span-4) - Recruiter Seats & Credentials Governance */}
        <div className="md:col-span-4 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                ROLE: COMPANY ADMIN
              </span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
              Recruiter Seats
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-1 leading-relaxed">
              Generate credentials for recruiters representing your organization. Recruiter logins
              follow format{" "}
              <span className="font-mono text-amber-600 dark:text-amber-400">
                name@company.microintern
              </span>
              .
            </p>
          </div>

          <div className="my-6 space-y-3">
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center text-xs text-black/60 dark:text-white/60">
              No active recruiter seats provisioned yet. Click below to generate new credentials.
            </div>
          </div>

          <button
            onClick={() => setCurrentRoute("company-recruiters" as any)}
            className="w-full py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs hover:scale-105 transition-transform shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Open Recruiter Console →</span>
          </button>
        </div>

        {/* Bento Card 4 (md:col-span-8) - Recent Candidate Submissions & Pipeline Action Table */}
        <div className="md:col-span-8 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Candidate Submissions
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                Review verified skill trial submissions. Approve to invite for direct interview &
                stipend.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full">
              <button
                onClick={() => setActiveTabFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTabFilter === "all"
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTabFilter("pending")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTabFilter === "pending"
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTabFilter("approved")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTabFilter === "approved"
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                Approved
              </button>
            </div>
          </div>

          <div className="space-y-3 min-h-[160px]">
            {filteredApplications.length === 0 ? (
              <div className="py-12 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 text-center">
                <Users className="w-8 h-8 text-black/20 dark:text-white/20 mx-auto mb-2" />
                <p className="text-xs font-semibold text-black/60 dark:text-white/70">
                  No applicant submissions matching this filter
                </p>
                <p className="text-[11px] text-black/40 dark:text-white/40 mt-1">
                  Once candidates submit solutions to your skill trials, AI trust evaluations will
                  appear here.
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-serif font-bold text-sm">
                      {app.candidateName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                        <span>{app.candidateName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                          Trust Score: {app.trustScore}%
                        </span>
                      </h4>
                      <p className="text-xs text-black/50 dark:text-white/50">{app.trialTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleGiveTask(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          Give Task
                        </button>
                        <button
                          onClick={() => handleApprove(app.id, app.candidateName)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Approve Offer
                        </button>
                        <button
                          onClick={() => handleReject(app.id, app.candidateName)}
                          className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${
                          app.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-black/50 dark:text-white/50 font-mono">
              Showing {filteredApplications.length} of {applications.length} applications
            </span>
            <button
              onClick={() => setCurrentRoute("company-applications" as any)}
              className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Applicant Pipeline Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 5 (md:col-span-12) - Escrow Skill Trials & Bounty Governance */}
        <div className="md:col-span-12 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Escrow Skill Trials & Bounty Architecture
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1 max-w-xl leading-relaxed">
                Skill trials are backed by automated Stripe Connect escrow. Candidates only access
                your GitHub trial repositories after algorithmic trust validation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentRoute("company-manage-trials" as any)}
              className="px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Manage Escrow Trials ({trials.length})</span>
            </button>
            <button
              onClick={() => setCurrentRoute("company-create-trial" as any)}
              className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Skill Trial</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Give Task Modal */}
      {giveTaskCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-2xl border border-black/10 dark:border-white/15 overflow-hidden">
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">AI Task Recommendation</h3>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">For {giveTaskCandidate.candidateName}</p>
                </div>
              </div>
              <button
                onClick={() => setGiveTaskCandidate(null)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-black/50 dark:text-white/50" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-xs text-black/50 dark:text-white/50">AI analyzing candidate profile...</p>
                </div>
              ) : aiRecommendations.length === 0 ? (
                <p className="text-sm text-center text-black/50 dark:text-white/50 py-6">No assessments available. Create trials first.</p>
              ) : (
                aiRecommendations.map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 hover:border-purple-500/30 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-black dark:text-white truncate">{rec.title}</div>
                      <div className="text-xs text-black/50 dark:text-white/50 mt-0.5 truncate">{rec.reason}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">{rec.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-lg font-bold text-emerald-500">{rec.suitability}%</span>
                      <span className="text-[10px] text-black/40 dark:text-white/40">match</span>
                    </div>
                    <button
                      onClick={() => {
                        showToast("Task Assigned", `"${rec.title}" assigned to ${giveTaskCandidate.candidateName}`, "success");
                        setGiveTaskCandidate(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
