"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { Building2, Save, Key, User } from "lucide-react";
import { authService } from "@/features/auth/services/auth.service";

export const CompanyProfilePage: React.FC = () => {
  const { userProfile, companyProfile, showToast } = useApp();
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Error", "Passwords do not match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("Error", "Password must be at least 8 characters", "error");
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(passwordForm.newPassword);
      showToast("Success", "Password updated successfully", "success");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast("Error", err.response?.data?.error?.message || "Failed to update password", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumbs items={[{ label: "Enterprise Portal" }, { label: "My Profile" }]} />

      <div className="bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-black/5 dark:border-white/10">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center text-4xl font-black shadow-inner border border-blue-500/20">
            {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : "E"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
              {userProfile.fullName || "Enterprise User"}
            </h1>
            <p className="text-black/50 dark:text-white/50 flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              {userProfile.email}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              {companyProfile?.companyName || "Enterprise"}
            </div>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-black dark:text-white">
            <Key className="w-5 h-5 text-blue-500" />
            Security Settings
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
