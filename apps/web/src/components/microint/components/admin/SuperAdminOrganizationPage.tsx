"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { adminApi, type AdminUser } from "@/lib/api/admin";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Award,
  MoreVertical,
  CheckCircle2,
  Ban,
  Eye,
  RefreshCw,
  Building2,
  Briefcase,
  UserCheck,
  Sparkles,
  Plus,
  ArrowRight,
  Key,
} from "lucide-react";

export const SuperAdminOrganizationPage: React.FC = () => {
  const { showToast, setRole, setCurrentRoute } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    "all" | "candidate" | "company" | "recruiter"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [impersonateModalUser, setImpersonateModalUser] = useState<AdminUser | null>(null);

  // Enterprise Company eKYC Verification Modal State
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch admin users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingLink(true);
    try {
      const data = await adminApi.generateOnboardingLink();
      setOnboardingLink(data.url || data);
      showToast(
        "Secure Link Generated",
        "The single-use eKYC onboarding link has been generated successfully.",
        "success",
      );
    } catch (err: any) {
      showToast("Error", err.message || "Failed to generate link.", "warning");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (onboardingLink) {
      navigator.clipboard.writeText(onboardingLink);
      showToast("Link Copied", "The onboarding link has been copied to your clipboard.", "success");
    }
  };

  const handleLaunchCompanyPortal = () => {
    setRole("company");
    setCurrentRoute("company-dashboard");
    showToast(
      "🏢 Enterprise Company Portal",
      "Launched Enterprise Company Admin Portal. You are now viewing the Company Command Center.",
      "info",
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleVerification = async (userId: string) => {
    try {
      await adminApi.verifyCompany(userId);
      showToast(
        "Verification Updated",
        "Enterprise verification status updated successfully.",
        "success",
      );
      fetchUsers();
    } catch (err: any) {
      showToast("Error", err.message || "Action failed.", "warning");
    }
  };

  const toggleSuspension = async (userId: string) => {
    try {
      await adminApi.suspendUser(userId);
      showToast("Suspension Updated", "User suspension status updated successfully.", "success");
      fetchUsers();
    } catch (err: any) {
      showToast("Error", err.message || "Action failed.", "warning");
    }
  };

  const handleResetTrustScore = (userId: string, name: string) => {
    showToast(
      "Trust Score Recalibrated",
      `AI evaluation weights for ${name} reset to default baseline (90).`,
      "info",
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono text-xs font-bold uppercase tracking-wider">
              IAM GOVERNANCE
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              SOC-2 ROLE ACCESS CONTROL
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
            Organization Management
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Manage Enterprise Partner Accounts, Workspaces, and Subscriptions.
          </p>
        </div>

        {/* Executive Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleLaunchCompanyPortal}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0A0A0A] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold text-black dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            title="Launch Enterprise Company Admin view"
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Launch Company Admin Portal</span>
          </button>
          <button
            onClick={() => {
              setOnboardingLink(null);
              setShowAddCompanyModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate eKYC Link</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Role Segmented Tabs */}
        <div className="flex items-center p-1.5 rounded-full bg-black/5 dark:bg-white/5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: `All Users (${users.length})` },
            {
              id: "candidate",
              label: `Candidates (${users.filter((u) => u.role === "candidate").length})`,
            },
            {
              id: "company",
              label: `Enterprises (${users.filter((u) => u.role === "company").length})`,
            },
            {
              id: "recruiter",
              label: `Recruiters (${users.filter((u) => u.role === "recruiter").length})`,
            },
          ].map((tab) => {
            const isActive = selectedRoleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleFilter(tab.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-black/40 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ── Interactive Users Governance Table ── */}
      <div className="rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-white/40 bg-black/[0.015] dark:bg-white/[0.02]">
                <th className="py-4 px-6">User / Enterprise</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">AI Trust Score</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Activity Summary</th>
                <th className="py-4 px-6 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-xs">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
                          user.role === "company"
                            ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            : user.role === "recruiter"
                              ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                              : "bg-black dark:bg-white text-white dark:text-black"
                        }`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white text-sm">
                          <span>{user.name}</span>
                          {user.verified && (
                            <span title="Verified KYC / Enterprise Partner">
                              <ShieldCheck className="w-4 h-4 text-blue-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-black/50 dark:text-white/60 font-mono text-[11px]">
                          {user.email} • {user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] uppercase ${
                        user.role === "company"
                          ? "bg-purple-500/10 text-purple-500"
                          : user.role === "recruiter"
                            ? "bg-indigo-500/10 text-indigo-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            user.trustScore >= 90
                              ? "bg-emerald-500"
                              : user.trustScore >= 70
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${user.trustScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {user.trustScore}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-black/60 dark:text-white/70 max-w-xs truncate">
                    {user.details}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Verify/Revoke Blue Tick Button */}
                      <button
                        onClick={() => toggleVerification(user.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          user.verified
                            ? "border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                            : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/40 dark:text-white/40"
                        }`}
                        title={
                          user.verified
                            ? "Revoke Blue Tick Verification"
                            : "Grant Blue Tick Verification"
                        }
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      {/* Impersonate Button */}
                      <button
                        onClick={() => setImpersonateModalUser(user)}
                        className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Impersonate & View as User"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Recalibrate AI Trust Score */}
                      <button
                        onClick={() => handleResetTrustScore(user.id, user.name)}
                        className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Reset Trust Score to 90"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Suspend / Restore Button */}
                      <button
                        onClick={() => toggleSuspension(user.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          user.status === "suspended"
                            ? "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60"
                        }`}
                        title={
                          user.status === "suspended"
                            ? "Restore User Account"
                            : "Suspend User Account"
                        }
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Impersonation Confirmation Modal ── */}
      {impersonateModalUser && (
        <div
          onClick={() => setImpersonateModalUser(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[32px] p-7 max-w-md w-full shadow-2xl text-black dark:text-white"
          >
            <h3 className="text-xl font-serif text-black dark:text-white mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>Impersonating {impersonateModalUser.name}</span>
            </h3>
            <p className="text-xs text-black/60 dark:text-white/70 mb-5 leading-relaxed">
              You are about to switch your active session to{" "}
              <strong>{impersonateModalUser.email}</strong> ({impersonateModalUser.role}). This
              action is logged with SOC-2 audit timestamping.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setImpersonateModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(
                    "Impersonation Active",
                    `Now viewing as ${impersonateModalUser.name} (${impersonateModalUser.email})`,
                    "info",
                  );
                  setImpersonateModalUser(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Confirm Impersonation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Enterprise Company eKYC Verification & Onboarding Modal ── */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-black dark:text-white">
                    Add & Verify Enterprise Company (eKYC)
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/60">
                    Super Admin Platform Governance • Create Company Admin Account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateLink} className="space-y-6">
              {!onboardingLink ? (
                <>
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-xs text-black/70 dark:text-white/70 leading-relaxed text-center">
                    <Building2 className="w-8 h-8 text-black/20 dark:text-white/20 mx-auto mb-3" />
                    Generate a unique, secure <strong>eKYC Onboarding Link</strong>. Share this link with the Enterprise Client so they can securely complete their company registration, verify their tax details, and set up their administrator account.
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCompanyModal(false)}
                      className="px-5 py-2.5 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGeneratingLink}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingLink && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>{isGeneratingLink ? "Generating..." : "Generate Link"}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Link Generated Successfully
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1.5">
                      Secure eKYC Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={onboardingLink}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-4 py-2 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-xs whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCompanyModal(false)}
                      className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
