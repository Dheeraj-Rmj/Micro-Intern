'use client';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Bell,
  Calendar,
  Sparkles,
  UserCheck,
  FileText,
  Compass,
  Code2,
} from 'lucide-react';


export const CandidateDashboard: React.FC = () => {
  const {
    trials,
    applications,
    notifications,
    userProfile,
    setCurrentRoute,
    applyForTrial,
    setActiveWorkspaceTrial,
    submissions,
  } = useApp();

  const completedTrialsCount = trials.filter((t) => t.status === 'completed').length;
  const activeTrialsCount = trials.filter((t) => t.status === 'in_progress' || t.status === 'applied').length;
  const pendingInvitationsCount = applications.filter((a) => a.status === 'shortlisted').length;

  const upcomingDeadlines = trials.filter((t) => t.deadline.includes('Day') || t.deadline.includes('Tomorrow')).slice(0, 3);
  const recommendedTrials = trials.filter((t) => t.status === 'open').slice(0, 3);

  const isProfileIncomplete = !userProfile.fullName || !userProfile.resumeFileName || !userProfile.email;

  return (
    <div>
      <Breadcrumbs currentTitle="Candidate Dashboard" />

      {/* Welcome Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frontend-Ready Prototype</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {userProfile.fullName ? `Welcome back, ${userProfile.fullName}!` : 'Welcome to MicroIntern!'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed">
            {isProfileIncomplete
              ? 'Complete your profile details and upload your resume to apply for active skill trials.'
              : `You have ${pendingInvitationsCount} shortlisted trial workspace ready. Complete trials to build your Trust Score.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isProfileIncomplete ? (
              <button
                onClick={() => setCurrentRoute('profile')}
                className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs sm:text-sm shadow-md hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-purple-900" />
                <span>Complete Your Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentRoute('workspace')}
                className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs sm:text-sm shadow-md hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 text-purple-900" />
              </button>
            )}

            <button
              onClick={() => setCurrentRoute('discover-trials')}
              className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-white border border-purple-400/40 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Discover New Trials
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Callout if Profile Incomplete */}
      {isProfileIncomplete && (
        <div className="mb-8 p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600 text-white">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Complete Your Profile • Upload Your Resume to Continue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Companies review candidate credentials and resume attachments before shortlisting for paid trials.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentRoute('profile')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-colors cursor-pointer whitespace-nowrap"
          >
            Update Profile Now
          </button>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Completed Trials */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Trials
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{completedTrialsCount}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {completedTrialsCount > 0 ? '+1 this month' : 'No completed trials yet'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Active Trials */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Trials
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{activeTrialsCount}</h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">In progress / applied</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Invitations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Invitations
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{pendingInvitationsCount}</h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">Shortlisted workspaces</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Trust Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trust Score
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {userProfile.trustScore}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              {userProfile.trustScore > 0 ? 'Verified Practitioner' : 'Unverified • Fill details'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Middle Section: Progress Chart + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base">Candidate Trust & Performance Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Score evolution from completed trials</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              API Ready
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
              <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Analytics Data Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Complete and submit your first trial workspace task to start tracking performance metrics and trust progression.
              </p>
            </div>
          ) : (
            <div className="h-56 w-full flex flex-col justify-between pt-4">
              <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                {[
                  { label: 'May', score: 65 },
                  { label: 'Jun', score: 78 },
                  { label: 'Jul', score: userProfile.trustScore || 85 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{item.score} pts</span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all duration-500 max-w-[48px]"
                      style={{ height: `${item.score}%` }}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-4">Recent Activity Timeline</h3>
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-xs text-slate-700 dark:text-slate-300">No Recent Activity</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Activity logs will appear here as you submit workspace tasks and apply for trials.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex items-start gap-3 relative pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold leading-tight">{n.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentRoute('submissions')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors mt-4 cursor-pointer text-center"
          >
            View Submissions History
          </button>
        </div>
      </div>

      {/* Bottom Section: Upcoming Deadlines & Recommended Trials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Upcoming Trial Deadlines</span>
            </h3>
            <button
              onClick={() => setCurrentRoute('my-applications')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              My Applications
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center p-6">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">No Active Trials</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                You have no active trials with upcoming deadlines. Browse available trials to apply.
              </p>
              <button
                onClick={() => setCurrentRoute('discover-trials')}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Discover Trials
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.company} • {t.stipend}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t.deadline}
                    </span>
                    <button
                      onClick={() => {
                        setActiveWorkspaceTrial(t);
                        setCurrentRoute('workspace');
                      }}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline block mt-1 cursor-pointer"
                    >
                      Open Workspace →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Trials */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Recommended For You</span>
            </h3>
            <button
              onClick={() => setCurrentRoute('discover-trials')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Explore All
            </button>
          </div>

          {recommendedTrials.length === 0 ? (
            <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center p-6">
              <Compass className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">No Trials Available Yet</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                No active trials posted yet. Check back soon or explore open positions.
              </p>
              <button
                onClick={() => setCurrentRoute('discover-trials')}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Discover Trials
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedTrials.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.company} • {t.stipend}</p>
                  </div>

                  <button
                    onClick={() => applyForTrial(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
