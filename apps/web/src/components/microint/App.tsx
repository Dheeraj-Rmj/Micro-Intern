"use client";
import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { Toast } from "./components/common/Toast";
import { LandingPage } from "./components/pages/LandingPage";
import { SignInPage } from "./components/auth/SignInPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { Sidebar } from "./components/dashboard/Sidebar";
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { CandidateDashboard } from "./components/pages/CandidateDashboard";
import { ProfilePage } from "./components/pages/ProfilePage";
import { DiscoverTrialsPage } from "./components/pages/DiscoverTrialsPage";
import { MyApplicationsPage } from "./components/pages/MyApplicationsPage";
import { WorkspacePage } from "./components/pages/WorkspacePage";
import { SubmissionsPage } from "./components/pages/SubmissionsPage";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { AchievementsPage } from "./components/pages/AchievementsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { NetworkPage } from "./components/pages/NetworkPage";
import {
  SuperAdminDashboard,
  SuperAdminOrganizationPage,
  SuperAdminSubscriptionsPage,
  SuperAdminAIAnalyticsPage,
  SuperAdminPaymentsPage,
  SuperAdminGlobalAnalyticsPage,
  SuperAdminSystemPage,
  SuperAdminEscrowTrialsPage,
} from "./components/admin";
import {
  CompanyDashboard,
  CompanyApplicationsPage,
  CompanyTrialsPage,
  CompanyRecruitersPage,
  CompanyDepartmentsPage,
  CompanyHiringAnalyticsPage,
  CompanyBillingPage,
  CompanyAIInsightsPage,
  CompanyAIGeneratorPage,
} from "./components/company";

const MainRouter: React.FC = () => {
  const { currentRoute, setCurrentRoute, role, setRole, showToast } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errParam = params.get("error");
      if (errParam) {
        // Clean URL to prevent recurring toasts on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (errParam === "AccountAlreadyExists") {
          showToast("Account Exists", "An account with this email already exists. Please log in instead.", "warning");
          setCurrentRoute("login");
        } else if (errParam === "AccountNotFound") {
          showToast("Account Not Found", "No account found with this email. Please sign up.", "warning");
          setCurrentRoute("signup");
        } else {
          showToast("Authentication Error", decodeURIComponent(errParam), "error");
        }
      }
    }
  }, [showToast, setCurrentRoute]);

  // 1. Fullscreen Loading Screen
  if (currentRoute === "loading") {
    return <LoadingScreen />;
  }

  // 2. Fullscreen Landing Page
  if (currentRoute === "landing") {
    return (
      <>
        <LandingPage />
        <Toast />
      </>
    );
  }

  // 3. Fullscreen Candidate Auth Views
  if (currentRoute === "signup" || currentRoute === "role-selection") {
    return (
      <>
        <SignUpPage />
        <Toast />
      </>
    );
  }

  // Public Candidate Login
  if (currentRoute === "signin" || currentRoute === "login") {
    return (
      <>
        <SignInPage initialPortal="candidate" />
        <Toast />
      </>
    );
  }

  // Private Enterprise Portal Login (/enterprise/login — Recruiters & Company Admins share this page)
  if (currentRoute === "enterprise-login") {
    return (
      <>
        <SignInPage initialPortal="enterprise" />
        <Toast />
      </>
    );
  }

  // Private Super Admin Ops Portal Login (/system-ops — Hidden, MFA Enforced)
  if (currentRoute === "system-ops") {
    return (
      <>
        <SignInPage initialPortal="ops" />
        <Toast />
      </>
    );
  }

  if (currentRoute === "forgot-password") {
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
      case "dashboard":
        return <CandidateDashboard />;
      case "network":
        return <NetworkPage />;
      case "profile":
        return <ProfilePage />;
      case "discover-trials":
        return <DiscoverTrialsPage />;
      case "my-applications":
        return <MyApplicationsPage />;
      case "workspace":
        return <WorkspacePage />;
      case "submissions":
        return <SubmissionsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "achievements":
        return <AchievementsPage />;
      case "settings":
        return <SettingsPage />;
      // Company Portal (Enterprise Admin - Zoho Corp)
      case "company-dashboard":
        return <CompanyDashboard />;
      case "company-recruiters":
        return <CompanyRecruitersPage />;
      case "company-departments":
        return <CompanyDepartmentsPage />;
      case "company-hiring-analytics":
        return <CompanyHiringAnalyticsPage />;
      case "company-billing":
        return <CompanyBillingPage />;
      case "company-ai-insights":
        return <CompanyAIInsightsPage />;
      case "company-ai-generator":
        return <CompanyAIGeneratorPage />;
      // Kept for backward compatibility/internal routing if needed
      case "company-applications":
      case "company-evaluations":
      case "company-interviews":
        return <CompanyApplicationsPage />;
      case "company-settings":
        return <CompanyRecruitersPage />;
      case "company-create-trial":
      case "company-manage-trials":
        return <CompanyTrialsPage />;
      case "admin-dashboard":
        return <SuperAdminDashboard />;
      case "admin-trials":
        return <SuperAdminEscrowTrialsPage />;
      case "admin-users":
      case "admin-organization":
        return <SuperAdminOrganizationPage />;
      case "admin-subscriptions":
        return <SuperAdminSubscriptionsPage />;
      case "admin-trust-ai":
      case "admin-ai-analytics":
        return <SuperAdminAIAnalyticsPage />;
      case "admin-payments":
        return <SuperAdminPaymentsPage />;
      case "admin-global-analytics":
        return <SuperAdminGlobalAnalyticsPage />;
      case "admin-system":
        return <SuperAdminSystemPage />;
      default:
        return <CandidateDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-black text-black dark:text-white transition-colors duration-300 relative overflow-x-hidden selection:bg-gray-200 selection:text-gray-900">
      {/* Background layer removed for clean SaaS UI */}

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
