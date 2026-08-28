"use client";

import { useState, useRef, useEffect } from "react";
import { KeyRound, ShieldCheck, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useApp } from "../../../components/microint/context/AppContext";

// Password strength rules — mirrors the backend PasswordSchema from @microintern/shared
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const ForcePasswordChangeModal = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useApp();
  const { user, updateUser } = useAuthStore();
  // Guard against state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword;
  const canSubmit = allRulesPassed && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      await authService.changePassword(password);
      if (mountedRef.current) {
        updateUser({ forcePasswordChange: false });
        showToast(
          "Password Updated",
          "Your password has been secured. You now have full access.",
          "success",
        );
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message =
          err instanceof Error ? err.message : "Failed to update password. Please try again.";
        showToast("Update Failed", message, "error");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  if (!user?.forcePasswordChange) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="force-pw-title"
    >
      <div className="w-full max-w-md p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 id="force-pw-title" className="text-2xl font-serif font-bold text-black dark:text-white">
            Action Required
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            For security, you must set a new password before accessing your dashboard. Your temporary
            password has been invalidated.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-sm text-black dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password strength checklist */}
          {password.length > 0 && (
            <ul className="space-y-1.5 text-xs" aria-label="Password requirements">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 transition-colors ${passed ? "text-green-500" : "text-black/50 dark:text-white/40"}`}
                  >
                    {passed ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-11 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border text-sm text-black dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "border-red-500"
                    : "border-black/10 dark:border-white/10"
                }`}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-red-500 text-xs mt-1.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isLoading ? "Updating..." : "Update Password & Continue"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

