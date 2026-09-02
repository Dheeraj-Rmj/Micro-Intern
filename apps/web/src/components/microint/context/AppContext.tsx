"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth.store";
import { journeyApi, submissionApi, notificationsApi } from "../../../lib/api/candidate-data";
import { assessmentApi } from "../../../lib/api/assessment";
import { companyApi } from "../../../lib/api/company";
import {
  PageRoute,
  UserRole,
  Trial,
  Application,
  Submission,
  AppNotification,
  AchievementBadge,
  UserProfile,
  CompanyProfile,
  InterviewSlot,
  CandidateSearchResult,
  RecruiterOffer,
} from "../types";

interface ToastInfo {
  id: string;
  title: string;
  desc?: string;
  type?: "success" | "info" | "warning" | "error";
}

interface AppContextType {
  currentRoute: PageRoute;
  setCurrentRoute: (route: PageRoute) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  companyProfile: CompanyProfile;
  setCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  trials: Trial[];
  applications: Application[];
  submissions: Submission[];
  notifications: AppNotification[];
  achievements: AchievementBadge[];
  interviews: InterviewSlot[];
  candidateSearchPool: CandidateSearchResult[];
  setCandidateSearchPool: React.Dispatch<React.SetStateAction<CandidateSearchResult[]>>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toastMessage: ToastInfo | null;
  showToast: (
    title: string,
    desc?: string,
    type?: "success" | "info" | "warning" | "error",
  ) => void;
  activeWorkspaceTrial: Trial | null;
  setActiveWorkspaceTrial: (trial: Trial | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleBookmark: (trialId: string) => void;
  applyForTrial: (trialId: string) => void;
  submitWorkspaceTask: (trialId: string, solutionText: string, fileNames: string[], proctoringEvents?: string[]) => void;
  markNotificationRead: (id: string) => void;
  unreadNotificationsCount: number;
  refreshTrials: () => Promise<void>;

  // Company Portal Operations
  createTrial: (trialData: Omit<Trial, "id" | "applicantsCount">) => void;
  updateTrial: (id: string, updated: Partial<Trial>) => void;
  deleteTrial: (id: string) => void;
  duplicateTrial: (id: string) => void;
  toggleTrialStatus: (id: string, status: "open" | "paused" | "closed" | "draft") => void;
  updateApplicationStatus: (appId: string, status: Application["status"], stage?: string) => void;
  updateSubmissionEvaluation: (
    subId: string,
    score: number,
    feedback: string,
    status: Submission["status"],
  ) => void;
  scheduleInterview: (slot: Omit<InterviewSlot, "id">) => void;
  cancelInterview: (id: string) => void;
  bookmarkCandidate: (candidateId: string) => void;
  inviteCandidate: (candidateId: string, trialId: string) => void;
  clearAllNotifications: () => void;

  // Recruiter Operations
  recruiterOffers: RecruiterOffer[];
  createOffer: (offer: Omit<RecruiterOffer, "id">) => void;
  updateOfferStatus: (id: string, status: RecruiterOffer["status"]) => void;
  deleteOffer: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() => {
    if (typeof window !== "undefined") {
      const savedRoute = sessionStorage.getItem("microintern_current_route") as PageRoute | null;
      if (savedRoute && savedRoute !== "loading") {
        return savedRoute;
      }
    }
    return "landing";
  });
  const [role, setRole] = useState<UserRole>("candidate");
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("microintern_user_profile");
      if (saved) {
        try {
          return JSON.parse(saved) as UserProfile;
        } catch {
          // ignore parse error
        }
      }
    }
    // Empty profile — will be filled from auth store on mount
    return {
      fullName: "", username: "", email: "", phone: "", avatar: "",
      location: "", college: "", degree: "", experienceYears: "",
      resumeFileName: "", aboutMe: "", skills: [], portfolioUrl: "",
      githubUrl: "", linkedinUrl: "", trustScore: 0,
    } as UserProfile;
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: "", logo: "", website: "", industry: "",
    companySize: "", headquarters: "", description: "",
    linkedinUrl: "", twitterUrl: "", githubUrl: "",
    ekycStatus: "UNVERIFIED",
  });
  const [trials, setTrials] = useState<Trial[]>([]);

  // Sync useAuthStore (global state) to AppContext userProfile (legacy state)
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state, prevState) => {
      if (state.user && state.user !== prevState.user) {
        setUserProfile((prev) => ({
          ...prev,
          id: state.user!.id,
          fullName: `${state.user!.firstName} ${state.user!.lastName}`,
          email: state.user!.email,
          role: state.user!.role,
          avatar: state.user!.avatarUrl || prev.avatar,
        }));
        
        // Ensure role state is synced
        if (state.user!.role === "SUPER_ADMIN" || state.user!.role === "ADMIN") {
          setRole("admin");
        } else if (state.user!.role === "COMPANY_OWNER" || state.user!.role === "RECRUITER") {
          setRole("company");
        } else {
          setRole("candidate");
        }

        // ── Onboarding gate: redirect new users to the wizard ──────────────
        if (!state.user!.isOnboarded) {
          const role = state.user!.role;
          if (role === "COMPANY_OWNER") {
            setCurrentRoute("company-onboarding");
          } else if (role === "RECRUITER") {
            // Recruiters skip onboarding wizard — go straight to company dashboard
            setCurrentRoute("company-dashboard");
          } else if (role === "CANDIDATE") {
            setCurrentRoute("candidate-onboarding");
          }
        }
      }
    });
    
    // Initial sync
    const state = useAuthStore.getState();
    if (state.user) {
        setUserProfile((prev) => ({
          ...prev,
          id: state.user!.id,
          fullName: `${state.user!.firstName} ${state.user!.lastName}`,
          email: state.user!.email,
          role: state.user!.role,
          avatar: state.user!.avatarUrl || prev.avatar,
        }));
        
        // Ensure role state is synced
        if (state.user!.role === "SUPER_ADMIN" || state.user!.role === "ADMIN") {
          setRole("admin");
        } else if (state.user!.role === "COMPANY_OWNER" || state.user!.role === "RECRUITER") {
          setRole("company");
        } else {
          setRole("candidate");
        }

        // ── Onboarding gate on page refresh ────────────────────────────────
        if (!state.user!.isOnboarded) {
          const savedRoute = typeof window !== "undefined"
            ? sessionStorage.getItem("microintern_current_route")
            : null;
          // Only gate if not already in an onboarding or auth route
          const exemptRoutes = ["candidate-onboarding", "company-onboarding", "landing", "login", "signin", "signup", "forgot-password"];
          if (!savedRoute || !exemptRoutes.includes(savedRoute)) {
            if (state.user!.role === "COMPANY_OWNER") {
              setCurrentRoute("company-onboarding");
            } else if (state.user!.role === "RECRUITER") {
              // Recruiters skip onboarding wizard — go straight to company dashboard
              setCurrentRoute("company-dashboard");
            } else if (state.user!.role === "CANDIDATE") {
              setCurrentRoute("candidate-onboarding");
            }
          }
        }
    }
    
    return unsub;
  }, []);

  // Fetch Company Profile for Company Users
  useEffect(() => {
    const fetchCompany = async () => {
      if (role === "company" || role === "admin") {
        try {
          const profile = await companyApi.getCompanyProfile();
          if (profile) {
            setCompanyProfile({
              companyName: profile.name || "",
              logo: profile.logoUrl || "",
              website: profile.website || "",
              industry: profile.industry || "",
              companySize: profile.size || "",
              headquarters: profile.headquarters || "",
              description: profile.description || "",
              linkedinUrl: profile.linkedinUrl || "",
              twitterUrl: profile.twitterUrl || "",
              githubUrl: profile.githubUrl || "",
              ekycStatus: profile.ekycStatus || "UNVERIFIED",
            });
          }
        } catch (error) {
          console.error("Failed to fetch company profile:", error);
        }
      }
    };
    fetchCompany();
  }, [role]);

  const refreshTrials = async () => {
    try {
      const { assessments } = await assessmentApi.listPublicAssessments({ status: "PUBLISHED" });
      if (assessments && assessments.length > 0) {
        const apiTrials = assessments.map((a: any) => ({
          id: a.id,
          title: a.title,
          company: a.company?.name || "Company",
          roleTitle: a.roleTitle || "Role",
          difficulty: (a.complexityScore && a.complexityScore > 7
            ? "Advanced"
            : a.complexityScore && a.complexityScore < 4
              ? "Beginner"
              : "Intermediate") as "Beginner" | "Intermediate" | "Advanced",
          category: (a.skillsRequired && a.skillsRequired.length > 0) ? a.skillsRequired[0] : "All",
          skillsRequired: a.skillsRequired || [],
          timeCommitment: `${a.durationMinutes || 120} mins`,
          reward: "$0", // default mock
          applicantsCount: 0,
          status: (a.status === "PUBLISHED" ? "open" : "closed") as "open" | "closed",
          bookmarked: false,
          matchScore: 90, // mock score
          description: a.description,
          location: a.location || "Remote",
          workSetting: a.workSetting || "Remote",
          employmentType: a.employmentType || "Full-time",
          publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
          tasks: a.tasks?.map((t: any) => ({ title: t.title, description: t.description })) || [],
          logo: a.company?.logoUrl || "https://cdn-icons-png.flaticon.com/512/25/25231.png",
          stipend: a.stipendAmount ? `$${a.stipendAmount}` : "$0",
          duration: "48 Hours",
          deadline: "Rolling",
          deliverables: ["Code"],
        }));
        // Merge with mock trials to not break UI if there are no assessments
        setTrials((prev) => {
          const apiIds = apiTrials.map((a: any) => a.id);
          const filteredMocks = prev.filter((m) => !apiIds.includes(m.id));
          return [...apiTrials, ...filteredMocks];
        });
      }
    } catch (e) {
      console.error("Failed to fetch public trials:", e);
    }
  };

  useEffect(() => {
    refreshTrials();
  }, []);
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [achievements] = useState<AchievementBadge[]>([]);
  const [interviews, setInterviews] = useState<InterviewSlot[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("microintern_interviews");
      if (saved) {
        try {
          return JSON.parse(saved) as InterviewSlot[];
        } catch { }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("microintern_interviews", JSON.stringify(interviews));
    }
  }, [interviews]);
  const [candidateSearchPool, setCandidateSearchPool] = useState<CandidateSearchResult[]>([]);

  // ── Fetch real applications (candidate journeys) from API ──────────────────
  useEffect(() => {
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated) return;
    const fetchApplications = async () => {
      try {
        const journeys = await journeyApi.getMyCandidateJourneys();
        if (journeys && journeys.length > 0) {
          const mapped: Application[] = journeys.map((j) => ({
            id: j.id,
            trialId: j.assessmentId,
            trialTitle: j.assessment?.title || "Assessment",
            company: j.assessment?.company?.name || "Company",
            candidateName: authState.user ? `${authState.user.firstName} ${authState.user.lastName}` : "Candidate",
            candidateEmail: authState.user?.email || "",
            candidateAvatar: authState.user?.avatarUrl || "",
            appliedDate: new Date(j.createdAt).toLocaleDateString(),
            status: (j.status?.toLowerCase() === "hired" ? "accepted"
              : j.status?.toLowerCase() === "rejected" ? "rejected"
              : j.status?.toLowerCase() === "interview" || j.status?.toLowerCase() === "qualified" ? "shortlisted"
              : "applied") as Application["status"],
            matchScore: j.matchScore ?? j.score ?? 0,
            stage: j.stage || j.status || "Under Review",
          }));
          setApplications(mapped);
        }
      } catch {
        // silently ignore — candidate may not have journeys yet
      }
    };
    fetchApplications();
  }, []);

  // ── Fetch real submissions from API ────────────────────────────────────────
  useEffect(() => {
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated) return;
    const fetchSubmissions = async () => {
      try {
        const subs = await submissionApi.getMyCandidateSubmissions();
        if (subs && subs.length > 0) {
          const mapped: Submission[] = subs.map((s) => ({
            id: s.id,
            trialId: s.assessmentId,
            trialTitle: s.assessment?.title || "Assessment",
            company: s.assessment?.company?.name || "Company",
            repoUrl: s.repoUrl,
            submittedAt: s.submittedAt
              ? new Date(s.submittedAt).toLocaleDateString()
              : new Date(s.createdAt).toLocaleDateString(),
            status: (
              s.status === "PENDING" ? "Under Review"
              : s.status === "EVALUATED" || s.status === "SCORED" ? "Evaluated"
              : s.status === "APPROVED" ? "Approved"
              : s.status === "REJECTED" ? "Rejected"
              : "Under Review"
            ) as Submission["status"],
            score: s.score ?? undefined,
            feedback: s.feedback ?? undefined,
            fileNames: [],
            performanceClassification: s.evaluation?.rawResponse?.performanceClassification,
            strengths: s.evaluation?.strengths,
            improvements: s.evaluation?.improvements,
            learningRecommendations: s.evaluation?.rawResponse?.learningRecommendations,
            aiSummary: s.evaluation?.summary,
          }));
          setSubmissions(mapped);
        }
      } catch {
        // silently ignore
      }
    };
    fetchSubmissions();

    // Poll every 10 seconds to update submissions that are under review
    const intervalId = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // ── Fetch real notifications from API ──────────────────────────────────────
  useEffect(() => {
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const notifs = await notificationsApi.list();
        if (notifs && notifs.length > 0) {
          const mapped: AppNotification[] = notifs.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.body,
            timestamp: new Date(n.createdAt).toLocaleString(),
            category: (
              n.type?.toLowerCase().includes("trial") ? "trial"
              : n.type?.toLowerCase().includes("application") ? "application"
              : n.type?.toLowerCase().includes("interview") ? "interview"
              : n.type?.toLowerCase().includes("evaluation") || n.type?.toLowerCase().includes("eval") ? "evaluation"
              : n.type?.toLowerCase().includes("achievement") ? "achievement"
              : "system"
            ) as AppNotification["category"],
            read: n.isRead,
          }));
          setNotifications(mapped);
        }
      } catch {
        // silently ignore
      }
    };
    fetchNotifications();
  }, []);

  const { theme, setTheme, systemTheme } = useTheme();

  // Compute resolved theme to maintain compatibility with existing context consumers
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    // Determine the active theme based on next-themes resolution
    const currentTheme = theme === "system" ? systemTheme : theme;
    setDarkModeState(currentTheme === "dark");
  }, [theme, systemTheme]);

  // Wrapper function to update next-themes while keeping the setDarkMode API intact
  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  const [toastMessage, setToastMessage] = useState<ToastInfo | null>(null);
  const [activeWorkspaceTrial, setActiveWorkspaceTrial] = useState<Trial | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Persist current route across browser refresh
  useEffect(() => {
    if (typeof window !== "undefined" && currentRoute !== "loading") {
      sessionStorage.setItem("microintern_current_route", currentRoute);
    }
  }, [currentRoute]);

  // Persist user profile (avatar, resume, bio, skills, social links)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("microintern_user_profile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const showToast = (
    title: string,
    desc?: string,
    type: "success" | "info" | "warning" | "error" = "success",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToastMessage({ id, title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const toggleBookmark = (trialId: string) => {
    setTrials((prev) =>
      prev.map((t) => {
        if (t.id === trialId) {
          const nextVal = !t.isBookmarked;
          showToast(
            nextVal ? "Saved to Bookmarks" : "Removed from Bookmarks",
            `Trial "${t.title}" bookmark status updated.`,
            "info",
          );
          return { ...t, isBookmarked: nextVal };
        }
        return t;
      }),
    );
  };

  const applyForTrial = async (trialId: string) => {
    const targetTrial = trials.find((t) => t.id === trialId);
    if (!targetTrial) return;

    if (targetTrial.status === "applied" || targetTrial.status === "in_progress") {
      showToast("Already Applied", `You have an active status for "${targetTrial.title}".`, "info");
      return;
    }

    // Enforce profile completion before applying
    const isProfileComplete = 
      userProfile.skills && userProfile.skills.length > 0 &&
      userProfile.aboutMe && userProfile.aboutMe.trim() !== "";
      
    if (!isProfileComplete) {
      showToast("Profile Incomplete", "Please update your skills and bio in Settings before applying to skill trials.", "warning");
      setCurrentRoute("settings");
      return;
    }

    try {
      if (!targetTrial.id.startsWith("mock")) {
        await assessmentApi.startAssessment(targetTrial.id);
      }
    } catch (err: any) {
      if (err?.response?.data?.message === "You have already started this assessment") {
        // Ignored if already started
      } else {
        console.error("Failed to start assessment:", err);
        showToast("Error", "Failed to start trial. Please try again.", "error");
        return;
      }
    }

    setTrials((prev) =>
      prev.map((t) =>
        t.id === trialId ? { ...t, status: "applied", applicantsCount: t.applicantsCount + 1 } : t,
      ),
    );

    const newApp: Application = {
      id: `app-${Date.now()}`,
      trialId: targetTrial.id,
      trialTitle: targetTrial.title,
      company: targetTrial.company,
      candidateName: userProfile.fullName || "Anonymous Candidate",
      candidateEmail: userProfile.email || "candidate@example.com",
      candidateAvatar: userProfile.avatar,
      appliedDate: new Date().toISOString().split("T")[0] || "",
      status: "applied",
      matchScore: Math.floor(Math.random() * 12) + 88,
      stage: "Under Initial Screening",
    };

    setApplications((prev) => [newApp, ...prev]);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Application Submitted!",
      message: `Your application for "${targetTrial.title}" at ${targetTrial.company} was submitted successfully.`,
      timestamp: "Just now",
      category: "application",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      "Application Submitted!",
      `Successfully applied to ${targetTrial.company}.`,
      "success",
    );
  };
  const submitWorkspaceTask = async (
    trialId: string,
    solutionText: string,
    fileNames: string[],
    proctoringEvents?: string[],
  ) => {
    const targetTrial = trials.find((t) => t.id === trialId) || activeWorkspaceTrial;
    const title = targetTrial ? targetTrial.title : "MicroIntern Trial Task";
    const company = targetTrial ? targetTrial.company : "Enterprise Partner";

    let apiSubmission: { id: string; status: string; score?: number; feedback?: string } | null = null;
    try {
      if (targetTrial && !targetTrial.id.startsWith("mock")) {
        apiSubmission = await submissionApi.submitAssessment(targetTrial.id, {
          solutionText,
          fileNames,
          proctoringEvents,
        });
      }
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      showToast("Error", "Failed to submit code. Using local fallback.", "warning");
    }

    const newSub: Submission = {
      id: apiSubmission?.id || `sub-${Date.now()}`,
      trialId: trialId,
      trialTitle: title,
      company: company,
      candidateName: userProfile.fullName || "Candidate",
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: (apiSubmission?.status?.toLowerCase() as Submission["status"]) || "Under Review",
      score: apiSubmission?.score,
      feedback: apiSubmission?.feedback || "Your submission is being evaluated by our AI system.",
      fileNames: fileNames.length > 0 ? fileNames : ["workspace_solution.ts", "readme.md"],
    };

    setSubmissions((prev) => [newSub, ...prev]);

    if (targetTrial) {
      setTrials((prev) =>
        prev.map((t) => (t.id === targetTrial.id ? { ...t, status: "completed" } : t)),
      );
    }

    setUserProfile((prev) => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + 2),
    }));

    showToast(
      "Trial Submitted Successfully!",
      "Your submission is now under review. +2 Trust Score!",
      "success",
    );
  };

  const [recruiterOffers, setRecruiterOffers] = useState<RecruiterOffer[]>([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)));
    // Fire-and-forget API call
    notificationsApi.markRead(id).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    notificationsApi.markAllRead().catch(() => {});
    showToast("Notifications Cleared", "All notifications marked as read", "info");
  };

  const createOffer = (offer: Omit<RecruiterOffer, "id">) => {
    const newOffer: RecruiterOffer = {
      ...offer,
      id: `offer-${Date.now()}`,
    };
    setRecruiterOffers((prev) => [newOffer, ...prev]);
    showToast("Offer Created", `Official offer generated for ${offer.candidateName}`, "success");
  };

  const updateOfferStatus = (id: string, status: RecruiterOffer["status"]) => {
    setRecruiterOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast("Offer Status Updated", `Offer status changed to ${status}`, "info");
  };

  const deleteOffer = (id: string) => {
    setRecruiterOffers((prev) => prev.filter((o) => o.id !== id));
    showToast("Offer Revoked", "The offer has been removed", "warning");
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // --- Company Actions ---
  const createTrial = (trialData: Omit<Trial, "id" | "applicantsCount">) => {
    const newId = `trial-${Date.now()}`;
    const companyName = companyProfile.companyName || "Your Company";
    const logoUrl =
      companyProfile.logo ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80";

    const newTrial: Trial = {
      ...trialData,
      id: newId,
      company: companyName,
      logo: logoUrl,
      applicantsCount: 0,
      status: trialData.status || "open",
    };

    setTrials((prev) => [newTrial, ...prev]);
    showToast(
      trialData.status === "draft" ? "Trial Saved as Draft" : "Skill Trial Published!",
      `"${trialData.title}" is now active in your company workspace.`,
      "success",
    );
  };

  const updateTrial = (id: string, updated: Partial<Trial>) => {
    setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    showToast("Trial Updated", "Changes saved successfully.", "info");
  };

  const deleteTrial = (id: string) => {
    setTrials((prev) => prev.filter((t) => t.id !== id));
    showToast("Trial Deleted", "The trial has been removed.", "warning");
  };

  const duplicateTrial = (id: string) => {
    const target = trials.find((t) => t.id === id);
    if (!target) return;
    const duplicated: Trial = {
      ...target,
      id: `trial-${Date.now()}`,
      title: `${target.title} (Copy)`,
      applicantsCount: 0,
      status: "draft",
    };
    setTrials((prev) => [duplicated, ...prev]);
    showToast("Trial Duplicated", `Created draft copy "${duplicated.title}".`, "info");
  };

  const toggleTrialStatus = (id: string, status: "open" | "paused" | "closed" | "draft") => {
    setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    showToast("Status Updated", `Trial status changed to ${status.toUpperCase()}.`, "info");
  };

  const updateApplicationStatus = (
    appId: string,
    status: Application["status"],
    stage?: string,
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, stage: stage || a.stage } : a)),
    );
    showToast(
      "Candidate Status Updated",
      `Application moved to ${status.toUpperCase()}.`,
      "success",
    );
  };

  const updateSubmissionEvaluation = (
    subId: string,
    score: number,
    feedback: string,
    status: Submission["status"],
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, score, feedback, status } : s)),
    );
    showToast("Evaluation Saved", `Submission marked as ${status}. Score: ${score}/100`, "success");
  };

  const scheduleInterview = (slot: Omit<InterviewSlot, "id">) => {
    const newSlot: InterviewSlot = {
      ...slot,
      id: `interview-${Date.now()}`,
    };
    setInterviews((prev) => [newSlot, ...prev]);
    showToast(
      "Interview Scheduled",
      `Meeting with ${slot.candidateName} scheduled for ${slot.date} at ${slot.time}.`,
      "success",
    );
  };

  const cancelInterview = (id: string) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i)));
    showToast("Interview Cancelled", "The scheduled session was marked as cancelled.", "warning");
  };

  const bookmarkCandidate = (candidateId: string) => {
    setCandidateSearchPool((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const nextState = !c.isBookmarked;
          showToast(
            nextState ? "Candidate Bookmarked" : "Candidate Unbookmarked",
            `${c.fullName}`,
            "info",
          );
          return { ...c, isBookmarked: nextState };
        }
        return c;
      }),
    );
  };

  const inviteCandidate = (candidateId: string, trialId: string) => {
    const candidate = candidateSearchPool.find((c) => c.id === candidateId);
    const trial = trials.find((t) => t.id === trialId);
    if (!candidate || !trial) return;

    setCandidateSearchPool((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, isInvited: true } : c)),
    );

    // Create application entry
    const newApp: Application = {
      id: `app-invite-${Date.now()}`,
      trialId: trial.id,
      trialTitle: trial.title,
      company: trial.company,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidateAvatar: candidate.avatar,
      appliedDate: new Date().toISOString().split("T")[0] || "",
      status: "shortlisted",
      matchScore: candidate.matchScore,
      stage: "Company Invited Candidate",
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(
      "Invitation Sent!",
      `Invited ${candidate.fullName} to trial "${trial.title}".`,
      "success",
    );
  };

  if (!isMounted) return null;

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        role,
        setRole,
        userProfile,
        setUserProfile,
        companyProfile,
        setCompanyProfile,
        trials,
        applications,
        submissions,
        notifications,
        achievements,
        interviews,
        candidateSearchPool,
        setCandidateSearchPool,
        darkMode,
        setDarkMode,
        toastMessage,
        showToast,
        activeWorkspaceTrial,
        setActiveWorkspaceTrial,
        searchQuery,
        setSearchQuery,
        toggleBookmark,
        applyForTrial,
        submitWorkspaceTask,
        markNotificationRead,
        clearAllNotifications,
        unreadNotificationsCount,

        // Company
        refreshTrials,
        createTrial,
        updateTrial,
        deleteTrial,
        duplicateTrial,
        toggleTrialStatus,
        updateApplicationStatus,
        updateSubmissionEvaluation,
        scheduleInterview,
        cancelInterview,
        bookmarkCandidate,
        inviteCandidate,

        // Recruiter
        recruiterOffers,
        createOffer,
        updateOfferStatus,
        deleteOffer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
