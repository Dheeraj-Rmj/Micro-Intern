"use client";
import React, { useState } from "react";
import { apiClient, setAccessToken } from "../../../../lib/api/client";
import { authClient } from "../../../../lib/better-auth";
import { useApp } from "../../context/AppContext";
import { Eye, EyeOff, AlertCircle, ArrowLeft, Sun, Moon } from "lucide-react";

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

export const SignUpPage: React.FC = () => {
  const { setCurrentRoute, showToast, setUserProfile, setRole } = useApp();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const passwordStrength = (pass: string) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    } else if (!formData.fullName.trim().includes(" ")) {
      errs.fullName = "Please enter both first and last name";
    }
    if (!formData.username.trim()) {
      errs.username = "Username is required";
    } else if (formData.username.length < 3) {
      errs.username = "At least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errs.username = "Letters, numbers, and underscores only";
    }
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Invalid email address";
    }
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 8) {
      errs.password = "Must be at least 8 characters";
    }
    if (formData.confirmPassword !== formData.password) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!formData.acceptTerms) {
      errs.terms = "You must accept the Terms and Privacy Policy";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);

      const firstName = formData.fullName.split(' ')[0] || formData.fullName;
      const lastName = formData.fullName.split(' ').slice(1).join(' ') || '';

      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        firstName,
        lastName,
        username: formData.username,
        role: "CANDIDATE",
      } as any);

      if (error) {
        throw new Error(error.message);
      }

      const user = data.user as any;
      
      setUserProfile(user);
      setRole("candidate");

      showToast("Account Created! 🎉", "Welcome to MicroIntern.", "success");
      setCurrentRoute("dashboard");
    } catch (err: any) {
      showToast(
        "Registration Failed",
        err.message || "Could not create your account.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    const API_URL =
      process.env["NEXT_PUBLIC_API_URL"] || "https://micro-intern-4stz.onrender.com/api/v1";
    window.location.href = `${API_URL}/auth/${provider.toLowerCase()}?action=signup`;
  };

  const isFormValid =
    formData.fullName.trim().length > 0 &&
    formData.fullName.trim().includes(" ") &&
    formData.username.trim().length >= 3 &&
    formData.email.trim().length > 0 &&
    formData.password.length >= 8 &&
    formData.confirmPassword === formData.password &&
    formData.acceptTerms;

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans select-none transition-colors duration-300 ${
        isDark ? "bg-[#0E0E0E] text-white" : "bg-[#FAFAFA] text-black"
      }`}
    >
      {/* ── Sparse Ambient Dot Matrix Background (Nothing Style) ────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, transparent 1.5px)"
            : "radial-gradient(circle, rgba(0,0,0,0.25) 1.5px, transparent 1.5px)",
          backgroundSize: "100px 100px",
          backgroundPosition: "center center",
        }}
      />

      {/* ── Top Left Back Button ────────────────────────────────────── */}
      <button
        onClick={() => setCurrentRoute("landing")}
        className={`absolute top-6 left-6 w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer z-20 ${
          isDark
            ? "bg-[#262626] hover:bg-[#333333] text-white"
            : "bg-white hover:bg-[#EAEAEA] text-black border border-black/10"
        }`}
        title="Back to home"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* ── Top Right Theme Toggle Button ────────────────────────────── */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? "bg-[#262626] hover:bg-[#333333] text-white"
              : "bg-white hover:bg-[#EAEAEA] text-black border border-black/10"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Vertical Left Brand Text ────────────────────────────────── */}
      <div
        className={`absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[11px] font-mono tracking-[0.3em] uppercase select-none z-10 pointer-events-none whitespace-nowrap transition-colors duration-300 ${
          isDark ? "text-white/50" : "text-black/60"
        }`}
      >
        MICRO INTERN
      </div>

      {/* ── Center Auth Card (1:1 Nothing Account Clone) ────────────── */}
      <div
        className={`w-full max-w-[460px] rounded-[32px] p-8 md:p-10 shadow-2xl relative z-20 my-auto transition-colors duration-300 ${
          isDark ? "bg-[#262626] text-white" : "bg-[#EDEDE7] border border-black/[0.08] text-black"
        }`}
      >
        <h1 className="text-3xl font-serif font-normal tracking-tight mb-6">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none border ${
                isDark
                  ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                  : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
              }`}
            />
            <ErrorMsg msg={errors.fullName} />
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className={`w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none border ${
                isDark
                  ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                  : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
              }`}
            />
            <ErrorMsg msg={errors.username} />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              className={`w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none border ${
                isDark
                  ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                  : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
              }`}
            />
            <ErrorMsg msg={errors.email} />
          </div>

          {/* Prevent browser password autofill / default password injection */}
          <input
            type="text"
            name="fake-username-prevent-autofill"
            autoComplete="username"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="fake-password-prevent-autofill"
            autoComplete="new-password"
            style={{ display: "none" }}
          />

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className={`w-full px-4 py-3 pr-14 rounded-2xl text-sm transition-all focus:outline-none border ${
                  isDark
                    ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                    : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                  isDark
                    ? "text-white bg-white/15 hover:bg-white/25 border border-white/20 shadow-sm"
                    : "text-black bg-black/10 hover:bg-black/15 border border-black/10 shadow-sm"
                }`}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength meter */}
            {formData.password && (
              <div className="flex items-center gap-1 mt-1.5 px-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength(formData.password) >= level
                        ? passwordStrength(formData.password) <= 2
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : isDark
                          ? "bg-white/10"
                          : "bg-black/10"
                    }`}
                  />
                ))}
                <span className="text-[10px] text-black/50 dark:text-white/50 ml-2 uppercase tracking-wider font-mono">
                  {passwordStrength(formData.password) <= 2 ? "Weak" : "Strong"}
                </span>
              </div>
            )}
            <ErrorMsg msg={errors.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={`w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none border ${
                isDark
                  ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                  : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
              }`}
            />
            <ErrorMsg msg={errors.confirmPassword} />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="pt-1 pb-1">
            <label
              className={`flex items-start gap-2.5 cursor-pointer text-xs ${isDark ? "text-white/60" : "text-[#555555]"}`}
            >
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-4 h-4 rounded accent-[#111111] cursor-pointer mt-0.5 shrink-0"
              />
              <span className="leading-relaxed">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTermsModal(true);
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${isDark ? "text-white" : "text-black"}`}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPrivacyModal(true);
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${isDark ? "text-white" : "text-black"}`}
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>
            <ErrorMsg msg={errors.terms} />
          </div>

          {/* ── Create Account Pill + Circular White Social Buttons Row ── */}
          <div className="flex items-center gap-2 pt-2">
            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isFormValid
                  ? isDark
                    ? "bg-white hover:bg-gray-100 text-black shadow-md"
                    : "bg-[#111111] hover:bg-[#2A2A2A] text-white shadow-md"
                  : isDark
                    ? "bg-white/15 text-white/40 cursor-not-allowed"
                    : "bg-black/15 text-black/40 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : null}
              <span>{isLoading ? "Creating account..." : "Create account"}</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-black shadow-sm shrink-0 transition-all cursor-pointer"
              title="Sign up with Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleSocialAuth("Microsoft")}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-black shadow-sm shrink-0 transition-all cursor-pointer"
              title="Sign up with Microsoft"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialAuth("LinkedIn")}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-black shadow-sm shrink-0 transition-all cursor-pointer"
              title="Sign up with LinkedIn"
            >
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialAuth("GitHub")}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-black shadow-sm shrink-0 transition-all cursor-pointer"
              title="Sign up with GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Disclaimer Text */}
        <p
          className={`text-[11px] text-center leading-relaxed my-6 px-4 transition-colors ${
            isDark ? "text-white/60" : "text-[#7A7A7A]"
          }`}
        >
          By signing up, you agree to our{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrivacyModal(true);
            }}
            className={`font-semibold underline hover:opacity-80 cursor-pointer ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Privacy Policy
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTermsModal(true);
            }}
            className={`font-semibold underline hover:opacity-80 cursor-pointer ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            User Agreement
          </button>
          .
        </p>

        {/* Sign In Toggle Button (Prominent White Pill at Bottom) */}
        <button
          type="button"
          onClick={() => setCurrentRoute("signin")}
          className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer block text-center shadow-sm ${
            isDark
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-[#111111] hover:bg-[#2A2A2A] text-white"
          }`}
        >
          Sign in
        </button>
      </div>

      {/* ── Terms of Service Modal ── */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowTermsModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className={`relative rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col ${
              isDark ? "bg-[#262626] text-white" : "bg-white text-black"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-7 py-5 border-b ${isDark ? "border-white/10" : "border-[#E8E4D8]"}`}
            >
              <h2 className="text-lg font-bold">User Agreement & Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-white/10 text-white/70 hover:text-white"
                    : "hover:bg-[#F0F0F0] text-[#6A6A5A] hover:text-black"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-7 py-5 text-sm leading-relaxed space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                Last updated: August 2025
              </p>
              {[
                {
                  title: "1. Acceptance of Terms",
                  body: "By registering on MicroIntern, you agree to be bound by these Terms of Service. MicroIntern provides a platform connecting students and early-career candidates with companies offering short-form skill trials and internship opportunities.",
                },
                {
                  title: "2. Eligibility",
                  body: "You must be at least 16 years old to use MicroIntern. By registering, you confirm that you are eligible and that all information you provide is accurate and truthful.",
                },
                {
                  title: "3. Skill Trials",
                  body: "Trials posted on MicroIntern are real, company-issued briefs. Completion does not guarantee employment or payment unless explicitly stated by the company. MicroIntern facilitates the connection but is not a party to any hiring agreement.",
                },
                {
                  title: "4. Account Responsibility",
                  body: "You are responsible for maintaining the security of your account. You must not share credentials or impersonate others. MicroIntern reserves the right to suspend or terminate accounts that violate these terms.",
                },
                {
                  title: "5. Intellectual Property",
                  body: "Work submitted during trials may be reviewed by the posting company. Unless explicitly agreed otherwise, you retain ownership of your submissions.",
                },
                {
                  title: "6. Prohibited Conduct",
                  body: "You may not use MicroIntern to submit fraudulent work, scrape data, spam other users, or engage in any activity that disrupts the platform or harms other users.",
                },
                {
                  title: "7. Changes to Terms",
                  body: "MicroIntern may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
                },
              ].map((s) => (
                <div key={s.title}>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="opacity-80">{s.body}</p>
                </div>
              ))}
            </div>
            <div
              className={`px-7 py-4 border-t ${isDark ? "border-white/10" : "border-[#E8E4D8]"}`}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-[#111111] text-white hover:bg-[#333333]"
                }`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ── */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className={`relative rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col ${
              isDark ? "bg-[#262626] text-white" : "bg-white text-black"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-7 py-5 border-b ${isDark ? "border-white/10" : "border-[#E8E4D8]"}`}
            >
              <h2 className="text-lg font-bold">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-white/10 text-white/70 hover:text-white"
                    : "hover:bg-[#F0F0F0] text-[#6A6A5A] hover:text-black"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-7 py-5 text-sm leading-relaxed space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                Last updated: August 2025
              </p>
              {[
                {
                  title: "1. Data We Collect",
                  body: "We collect information you provide directly (name, email, resume, profile details) and usage data generated as you interact with MicroIntern (pages visited, trials started, submissions made).",
                },
                {
                  title: "2. How We Use Your Data",
                  body: "Your data is used to operate and improve MicroIntern, match you with relevant trials, send important platform notifications, and generate anonymised analytics. We do not sell your personal data.",
                },
                {
                  title: "3. Resume & Profile Data",
                  body: "Uploaded resumes and profile information may be shared with companies whose trials you apply to. You control which companies can see your profile through your privacy settings.",
                },
                {
                  title: "4. Cookies",
                  body: "MicroIntern uses essential cookies to keep you logged in and functional cookies to remember your preferences. No third-party advertising cookies are used.",
                },
                {
                  title: "5. Data Retention",
                  body: "Your account data is retained as long as your account is active. You may request deletion of your account and associated data at any time via Settings.",
                },
                {
                  title: "6. Security",
                  body: "We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no system is 100% secure — please use a strong, unique password.",
                },
                {
                  title: "7. Your Rights",
                  body: "You have the right to access, correct, export, or delete your data. Contact us at privacy@microintern.io for any data-related requests.",
                },
              ].map((s) => (
                <div key={s.title}>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="opacity-80">{s.body}</p>
                </div>
              ))}
            </div>
            <div
              className={`px-7 py-4 border-t ${isDark ? "border-white/10" : "border-[#E8E4D8]"}`}
            >
              <button
                onClick={() => setShowPrivacyModal(false)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-[#111111] text-white hover:bg-[#333333]"
                }`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
