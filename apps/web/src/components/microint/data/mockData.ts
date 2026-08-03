'use client';
import { Trial, Application, Submission, AppNotification, AchievementBadge, UserProfile, CompanyProfile, InterviewSlot, CandidateSearchResult } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  avatar: '',
  location: '',
  college: '',
  degree: '',
  experienceYears: '',
  resumeFileName: '',
  aboutMe: '',
  skills: [],
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  trustScore: 0,
};

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  companyName: '',
  logo: '',
  website: '',
  industry: '',
  companySize: '',
  headquarters: '',
  description: '',
  linkedinUrl: '',
  twitterUrl: '',
  githubUrl: '',
};

export const MOCK_TRIALS: Trial[] = [];

export const MOCK_APPLICATIONS: Application[] = [];

export const MOCK_SUBMISSIONS: Submission[] = [];

export const MOCK_NOTIFICATIONS: AppNotification[] = [];

export const MOCK_ACHIEVEMENTS: AchievementBadge[] = [];

export const MOCK_INTERVIEWS: InterviewSlot[] = [];

export const MOCK_CANDIDATES_SEARCH_POOL: CandidateSearchResult[] = [];

export const FAQ_ITEMS = [
  {
    q: 'What is MicroIntern?',
    a: 'MicroIntern is an AI-powered skill trial platform where candidates demonstrate their practical engineering and design capabilities by completing real-world 2-5 day company trials instead of traditional tedious resume screenings.',
  },
  {
    q: 'How does a Candidate Skill Trial work?',
    a: 'Companies post trial tasks with specific requirements. You apply or get invited, enter our interactive Workspace environment, review instructions, complete code/deliverables, and submit. AI & human reviewers evaluate your work to generate a Trust Score and extend direct internship offers.',
  },
  {
    q: 'What is the MicroIntern Trust Score?',
    a: 'The Trust Score (0–100) measures verified proof of talent based on completed trial quality, code cleanliness, timeliness, verified portfolio links, and peer/evaluator feedback. Higher Trust Scores unlock exclusive high-stipend trials.',
  },
  {
    q: 'Are trials paid?',
    a: 'Yes! Most trials offer stipend rewards upon approval, along with direct pathways to remote or hybrid internship placements.',
  },
  {
    q: 'Who can join MicroIntern?',
    a: 'Students, bootcamp grads, self-taught developers, and career switchers looking to prove real skills through action rather than resumes.',
  },
];

export const MOCK_COMPANIES: any[] = [];

