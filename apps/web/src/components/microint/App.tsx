'use client';
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoadingScreen } from './components/common/LoadingScreen';
import { Toast } from './components/common/Toast';
import { LandingPage } from './components/pages/LandingPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { Sidebar } from './components/dashboard/Sidebar';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { CandidateDashboard } from './components/pages/CandidateDashboard';
import { ProfilePage } from './components/pages/ProfilePage';
import { DiscoverTrialsPage } from './components/pages/DiscoverTrialsPage';
import { MyApplicationsPage } from './components/pages/MyApplicationsPage';
import { WorkspacePage } from './components/pages/WorkspacePage';
import { SubmissionsPage } from './components/pages/SubmissionsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { SettingsPage } from './components/pages/SettingsPage';

const MainRouter: React.FC = () => {
  const { currentRoute } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Fullscreen Loading Screen
  if (currentRoute === 'loading') {
    return <LoadingScreen />;
  }

  // 2. Fullscreen Landing Page
  if (currentRoute === 'landing') {
    return (
      <>
        <LandingPage />
        <Toast />
      </>
    );
  }

  // 3. Fullscreen Candidate Auth Views
  if (currentRoute === 'signup' || currentRoute === 'role-selection') {
    return (
      <>
        <SignUpPage />
        <Toast />
      </>
    );
  }

  if (currentRoute === 'signin') {
    return (
      <>
        <SignInPage />
        <Toast />
      </>
    );
  }

  if (currentRoute === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <Toast />
      </>
    );
  }

  // 4. Candidate Dashboard Application Layout
  const renderDashboardView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <CandidateDashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'discover-trials':
        return <DiscoverTrialsPage />;
      case 'my-applications':
        return <MyApplicationsPage />;
      case 'workspace':
        return <WorkspacePage />;
      case 'submissions':
        return <SubmissionsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CandidateDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Persistent Responsive Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderDashboardView()}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
