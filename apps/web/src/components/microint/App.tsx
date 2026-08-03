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
import { NetworkPage } from './components/pages/NetworkPage';
import {
  SuperAdminDashboard,
  SuperAdminUsersPage,
  SuperAdminTrialsPage,
  SuperAdminTrustAIPage,
  SuperAdminAuditLogsPage,
  SuperAdminSettingsPage,
} from './components/admin';
import {
  CompanyDashboard,
  CompanyApplicationsPage,
  CompanyTrialsPage,
  CompanyRecruitersPage,
} from './components/company';

const MainRouter: React.FC = () => {
  const { currentRoute, setCurrentRoute, role, setRole, showToast } = useApp();
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

  // Public Candidate Login
  if (currentRoute === 'signin' || currentRoute === 'login') {
    return (
      <>
        <SignInPage initialPortal="candidate" />
        <Toast />
      </>
    );
  }

  // Private Enterprise Portal Login (/enterprise/login — Recruiters & Company Admins share this page)
  if (currentRoute === 'enterprise-login') {
    return (
      <>
        <SignInPage initialPortal="enterprise" />
        <Toast />
      </>
    );
  }

  // Private Super Admin Ops Portal Login (/system-ops — Hidden, MFA Enforced)
  if (currentRoute === 'system-ops') {
    return (
      <>
        <SignInPage initialPortal="ops" />
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

  // 4. Candidate & Super Admin Dashboard Layout
  const renderDashboardView = () => {
    switch (currentRoute) {
      // Candidate Routes
      case 'dashboard':
        return <CandidateDashboard />;
      case 'network':
        return <NetworkPage />;
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
      // Company Portal (Enterprise Admin - Zoho Corp)
      case 'company-dashboard':
        return <CompanyDashboard />;
      case 'company-applications':
      case 'company-evaluations':
      case 'company-interviews':
        return <CompanyApplicationsPage />;
      case 'company-recruiters':
      case 'company-settings':
        return <CompanyRecruitersPage />;
      case 'company-create-trial':
      case 'company-manage-trials':
        return <CompanyTrialsPage />;
      // Super Admin Portal Routes
      case 'admin-dashboard':
        return <SuperAdminDashboard />;
      case 'admin-users':
        return <SuperAdminUsersPage />;
      case 'admin-trials':
        return <SuperAdminTrialsPage />;
      case 'admin-trust-ai':
        return <SuperAdminTrustAIPage />;
      case 'admin-audit-logs':
        return <SuperAdminAuditLogsPage />;
      case 'admin-settings':
        return <SuperAdminSettingsPage />;
      default:
        return <CandidateDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F2EA] dark:bg-black text-[#111111] dark:text-[#E1E0CC] transition-colors duration-300 relative overflow-x-hidden selection:bg-[#DEDBC8] selection:text-black">
      {/* ── Sparse Ambient Dot Matrix Background (Nothing Style) ────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(225,224,204,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
        }}
      />

      {/* Persistent Responsive Sidebar */}
      <div className="relative z-10 flex">
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
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
