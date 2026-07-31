'use client';
export type PageRoute =
  | 'loading'
  | 'landing'
  | 'role-selection'
  | 'signin'
  | 'signup'
  | 'forgot-password'
  // Candidate Routes
  | 'dashboard'
  | 'profile'
  | 'discover-trials'
  | 'my-applications'
  | 'workspace'
  | 'submissions'
  | 'notifications'
  | 'achievements'
  | 'settings'
  // Company Portal Routes
  | 'company-dashboard'
  | 'company-profile'
  | 'company-create-trial'
  | 'company-manage-trials'
  | 'company-applications'
  | 'company-candidate-search'
  | 'company-evaluations'
  | 'company-interviews'
  | 'company-reports'
  | 'company-notifications'
  | 'company-settings'
  // Recruiter Portal Routes
  | 'recruiter-dashboard'
  | 'recruiter-pipeline'
  | 'recruiter-candidates'
  | 'recruiter-interviews'
  | 'recruiter-offers'
  | 'recruiter-reports'
  | 'recruiter-notifications'
  | 'recruiter-settings';

export type UserRole = 'candidate' | 'recruiter' | 'company' | 'admin';

export interface Trial {
  id: string;
  title: string;
  company: string;
  logo: string;
  category: 'Full Stack' | 'Frontend' | 'AI / ML' | 'Backend' | 'UI/UX Design' | 'DevOps';
  stipend: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string;
  applicantsCount: number;
  skillsRequired: string[];
  description: string;
  deliverables: string[];
  isBookmarked?: boolean;
  status?: 'open' | 'applied' | 'in_progress' | 'completed' | 'draft' | 'paused' | 'closed';
  evaluationCriteria?: string[];
}

export interface Application {
  id: string;
  trialId: string;
  trialTitle: string;
  company: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateAvatar?: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'accepted' | 'interviewing';
  matchScore: number;
  stage: string;
}

export interface Submission {
  id: string;
  trialId: string;
  trialTitle: string;
  company: string;
  candidateName?: string;
  submittedAt: string;
  status: 'Under Review' | 'Evaluated' | 'Approved' | 'Revision Requested' | 'Rejected';
  score?: number;
  feedback?: string;
  fileNames: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'trial' | 'application' | 'system' | 'achievement' | 'interview' | 'evaluation';
  read: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  unlockedAt: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  college: string;
  degree: string;
  experienceYears: string;
  resumeFileName: string;
  aboutMe: string;
  headline?: string;
  bio?: string;
  skills: string[];
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  trustScore: number;
}

export interface CompanyProfile {
  companyName: string;
  logo: string;
  website: string;
  industry: string;
  companySize: string;
  headquarters: string;
  description: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
}

export interface CandidateSearchResult {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  trustScore: number;
  matchScore: number;
  isBookmarked?: boolean;
  isInvited?: boolean;
  resumeFileName?: string;
  college?: string;
}

export interface InterviewSlot {
  id: string;
  candidateName: string;
  trialTitle: string;
  date: string;
  time: string;
  interviewer: string;
  meetingUrl: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export type PipelineStage = 'Applied' | 'Shortlisted' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface RecruiterOffer {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  roleTitle: string;
  department: string;
  stipendAmount: string;
  salary: string;
  startDate: string;
  expirationDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Pending Review';
  sentDate?: string;
  notes?: string;
}

