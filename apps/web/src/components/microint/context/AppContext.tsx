'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_COMPANY_PROFILE,
  MOCK_TRIALS,
  MOCK_APPLICATIONS,
  MOCK_SUBMISSIONS,
  MOCK_NOTIFICATIONS,
  MOCK_ACHIEVEMENTS,
  MOCK_INTERVIEWS,
  MOCK_CANDIDATES_SEARCH_POOL,
} from '../data/mockData';

interface ToastInfo {
  id: string;
  title: string;
  desc?: string;
  type?: 'success' | 'info' | 'warning';
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
  showToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
  activeWorkspaceTrial: Trial | null;
  setActiveWorkspaceTrial: (trial: Trial | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleBookmark: (trialId: string) => void;
  applyForTrial: (trialId: string) => void;
  submitWorkspaceTask: (trialId: string, solutionText: string, fileNames: string[]) => void;
  markNotificationRead: (id: string) => void;
  unreadNotificationsCount: number;

  // Company Portal Operations
  createTrial: (trialData: Omit<Trial, 'id' | 'applicantsCount'>) => void;
  updateTrial: (id: string, updated: Partial<Trial>) => void;
  deleteTrial: (id: string) => void;
  duplicateTrial: (id: string) => void;
  toggleTrialStatus: (id: string, status: 'open' | 'paused' | 'closed' | 'draft') => void;
  updateApplicationStatus: (appId: string, status: Application['status'], stage?: string) => void;
  updateSubmissionEvaluation: (subId: string, score: number, feedback: string, status: Submission['status']) => void;
  scheduleInterview: (slot: Omit<InterviewSlot, 'id'>) => void;
  cancelInterview: (id: string) => void;
  bookmarkCandidate: (candidateId: string) => void;
  inviteCandidate: (candidateId: string, trialId: string) => void;
  clearAllNotifications: () => void;

  // Recruiter Operations
  recruiterOffers: RecruiterOffer[];
  createOffer: (offer: Omit<RecruiterOffer, 'id'>) => void;
  updateOfferStatus: (id: string, status: RecruiterOffer['status']) => void;
  deleteOffer: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('loading');
  const [role, setRole] = useState<UserRole>('candidate');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(INITIAL_COMPANY_PROFILE);
  const [trials, setTrials] = useState<Trial[]>(MOCK_TRIALS);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [achievements] = useState<AchievementBadge[]>(MOCK_ACHIEVEMENTS);
  const [interviews, setInterviews] = useState<InterviewSlot[]>(MOCK_INTERVIEWS);
  const [candidateSearchPool, setCandidateSearchPool] = useState<CandidateSearchResult[]>(MOCK_CANDIDATES_SEARCH_POOL);

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<ToastInfo | null>(null);
  const [activeWorkspaceTrial, setActiveWorkspaceTrial] = useState<Trial | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'warning' = 'success') => {
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
            nextVal ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
            `Trial "${t.title}" bookmark status updated.`,
            'info'
          );
          return { ...t, isBookmarked: nextVal };
        }
        return t;
      })
    );
  };

  const applyForTrial = (trialId: string) => {
    const targetTrial = trials.find((t) => t.id === trialId);
    if (!targetTrial) return;

    if (targetTrial.status === 'applied' || targetTrial.status === 'in_progress') {
      showToast('Already Applied', `You have an active status for "${targetTrial.title}".`, 'info');
      return;
    }

    setTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, status: 'applied', applicantsCount: t.applicantsCount + 1 } : t))
    );

    const newApp: Application = {
      id: `app-${Date.now()}`,
      trialId: targetTrial.id,
      trialTitle: targetTrial.title,
      company: targetTrial.company,
      candidateName: userProfile.fullName || 'Anonymous Candidate',
      candidateEmail: userProfile.email || 'candidate@example.com',
      candidateAvatar: userProfile.avatar,
      appliedDate: new Date().toISOString().split('T')[0] || '',
      status: 'applied',
      matchScore: Math.floor(Math.random() * 12) + 88,
      stage: 'Under Initial Screening',
    };

    setApplications((prev) => [newApp, ...prev]);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Application Submitted!',
      message: `Your application for "${targetTrial.title}" at ${targetTrial.company} was submitted successfully.`,
      timestamp: 'Just now',
      category: 'application',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Application Submitted!', `Successfully applied to ${targetTrial.company}.`, 'success');
  };

  const submitWorkspaceTask = (trialId: string, solutionText: string, fileNames: string[]) => {
    const targetTrial = trials.find((t) => t.id === trialId) || activeWorkspaceTrial;
    const title = targetTrial ? targetTrial.title : 'MicroIntern Trial Task';
    const company = targetTrial ? targetTrial.company : 'Enterprise Partner';

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      trialId: trialId,
      trialTitle: title,
      company: company,
      candidateName: userProfile.fullName || 'Alex Vance',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Under Review',
      score: 95,
      feedback: 'Automated evaluation complete. Code passed all unit tests and static syntax analysis.',
      fileNames: fileNames.length > 0 ? fileNames : ['workspace_solution.ts', 'readme.md'],
    };

    setSubmissions((prev) => [newSub, ...prev]);

    if (targetTrial) {
      setTrials((prev) => prev.map((t) => (t.id === targetTrial.id ? { ...t, status: 'completed' } : t)));
    }

    setUserProfile((prev) => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + 2),
    }));

    showToast('Trial Submitted Successfully!', 'Your submission is now under review. +2 Trust Score!', 'success');
  };

  const [recruiterOffers, setRecruiterOffers] = useState<RecruiterOffer[]>([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All notifications deleted', 'info');
  };

  const createOffer = (offer: Omit<RecruiterOffer, 'id'>) => {
    const newOffer: RecruiterOffer = {
      ...offer,
      id: `offer-${Date.now()}`,
    };
    setRecruiterOffers((prev) => [newOffer, ...prev]);
    showToast('Offer Created', `Official offer generated for ${offer.candidateName}`, 'success');
  };

  const updateOfferStatus = (id: string, status: RecruiterOffer['status']) => {
    setRecruiterOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    showToast('Offer Status Updated', `Offer status changed to ${status}`, 'info');
  };

  const deleteOffer = (id: string) => {
    setRecruiterOffers((prev) => prev.filter((o) => o.id !== id));
    showToast('Offer Revoked', 'The offer has been removed', 'warning');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // --- Company Actions ---
  const createTrial = (trialData: Omit<Trial, 'id' | 'applicantsCount'>) => {
    const newId = `trial-${Date.now()}`;
    const companyName = companyProfile.companyName || 'Your Company';
    const logoUrl = companyProfile.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80';

    const newTrial: Trial = {
      ...trialData,
      id: newId,
      company: companyName,
      logo: logoUrl,
      applicantsCount: 0,
      status: trialData.status || 'open',
    };

    setTrials((prev) => [newTrial, ...prev]);
    showToast(
      trialData.status === 'draft' ? 'Trial Saved as Draft' : 'Skill Trial Published!',
      `"${trialData.title}" is now active in your company workspace.`,
      'success'
    );
  };

  const updateTrial = (id: string, updated: Partial<Trial>) => {
    setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    showToast('Trial Updated', 'Changes saved successfully.', 'info');
  };

  const deleteTrial = (id: string) => {
    setTrials((prev) => prev.filter((t) => t.id !== id));
    showToast('Trial Deleted', 'The trial has been removed.', 'warning');
  };

  const duplicateTrial = (id: string) => {
    const target = trials.find((t) => t.id === id);
    if (!target) return;
    const duplicated: Trial = {
      ...target,
      id: `trial-${Date.now()}`,
      title: `${target.title} (Copy)`,
      applicantsCount: 0,
      status: 'draft',
    };
    setTrials((prev) => [duplicated, ...prev]);
    showToast('Trial Duplicated', `Created draft copy "${duplicated.title}".`, 'info');
  };

  const toggleTrialStatus = (id: string, status: 'open' | 'paused' | 'closed' | 'draft') => {
    setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    showToast('Status Updated', `Trial status changed to ${status.toUpperCase()}.`, 'info');
  };

  const updateApplicationStatus = (appId: string, status: Application['status'], stage?: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, stage: stage || a.stage } : a))
    );
    showToast('Candidate Status Updated', `Application moved to ${status.toUpperCase()}.`, 'success');
  };

  const updateSubmissionEvaluation = (subId: string, score: number, feedback: string, status: Submission['status']) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, score, feedback, status } : s))
    );
    showToast('Evaluation Saved', `Submission marked as ${status}. Score: ${score}/100`, 'success');
  };

  const scheduleInterview = (slot: Omit<InterviewSlot, 'id'>) => {
    const newSlot: InterviewSlot = {
      ...slot,
      id: `interview-${Date.now()}`,
    };
    setInterviews((prev) => [newSlot, ...prev]);
    showToast('Interview Scheduled', `Meeting with ${slot.candidateName} scheduled for ${slot.date} at ${slot.time}.`, 'success');
  };

  const cancelInterview = (id: string) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)));
    showToast('Interview Cancelled', 'The scheduled session was marked as cancelled.', 'warning');
  };

  const bookmarkCandidate = (candidateId: string) => {
    setCandidateSearchPool((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const nextState = !c.isBookmarked;
          showToast(nextState ? 'Candidate Bookmarked' : 'Candidate Unbookmarked', `${c.fullName}`, 'info');
          return { ...c, isBookmarked: nextState };
        }
        return c;
      })
    );
  };

  const inviteCandidate = (candidateId: string, trialId: string) => {
    const candidate = candidateSearchPool.find((c) => c.id === candidateId);
    const trial = trials.find((t) => t.id === trialId);
    if (!candidate || !trial) return;

    setCandidateSearchPool((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, isInvited: true } : c))
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
      appliedDate: new Date().toISOString().split('T')[0] || '',
      status: 'shortlisted',
      matchScore: candidate.matchScore,
      stage: 'Company Invited Candidate',
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast('Invitation Sent!', `Invited ${candidate.fullName} to trial "${trial.title}".`, 'success');
  };

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
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

