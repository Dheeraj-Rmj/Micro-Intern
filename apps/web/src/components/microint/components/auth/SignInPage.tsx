"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { apiClient, setAccessToken } from "../../../../lib/api/client";
import { useAuthStore } from "@/stores/auth.store";
import { startAuthentication } from "@simplewebauthn/browser";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
  ShieldAlert,
  Lock,
  Building2,
  UserCheck,
  Fingerprint,
} from "lucide-react";

interface SignInPageProps {
  initialPortal?: "candidate" | "enterprise" | "ops";
}

export const SignInPage: React.FC<SignInPageProps> = ({ initialPortal = "candidate" }) => {
  const { setCurrentRoute, showToast, setUserProfile, setRole, darkMode, setDarkMode } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  // Real API MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");

  // ── Hidden Private Shortcuts State (ONLY active when initialPortal === 'candidate' on /login) ──
  const [activeModal, setActiveModal] = useState<"none" | "recruiter" | "company" | "superadmin">(
    "none",
  );
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalMfa, setModalMfa] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalShowPassword, setModalShowPassword] = useState(false);

  // Keyboard shortcut listener: enabled ONLY while current route is /login (initialPortal === 'candidate')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user navigates away or is not on public candidate login, disable all shortcuts
      if (initialPortal !== "candidate") return;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toUpperCase();
        if (key === "R") {
          e.preventDefault();
          setActiveModal("recruiter");
          showToast(
            "Private Shortcut Unlocked",
            "CTRL+SHIFT+R: Recruiter ATS Login Modal opened.",
            "info",
          );
        } else if (key === "A") {
          e.preventDefault();
          setActiveModal("company");
          showToast(
            "Private Shortcut Unlocked",
            "CTRL+SHIFT+A: Company Admin Governance Modal opened.",
            "info",
          );
        } else if (key === "S") {
          e.preventDefault();
          setActiveModal("superadmin");
          showToast(
            "Private Shortcut Unlocked",
            "CTRL+SHIFT+S: System-Ops Super Admin Modal opened.",
            "info",
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [initialPortal, showToast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Step 2: Handle MFA Token Submission (Super Admin Ops typically)
      if (mfaRequired) {
        if (!mfaCode) {
          showToast("Missing MFA Code", "Please enter the 6-digit MFA token.", "warning");
          return;
        }

        const response = await apiClient.post("/auth/login/mfa", {
          mfaToken,
          code: mfaCode,
        });

        // Setup real session context
        const user = response.data.data.user;
        const accessToken = response.data.data.tokens?.accessToken;
        if (accessToken) setAccessToken(accessToken);
        useAuthStore.getState().setAuth(user, accessToken || "");
        setUserProfile(user);
        
        const userRole = user.role;
        if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
          setRole("admin");
          showToast("Authenticated", "MFA Verification successful.", "success");
          setCurrentRoute("admin-dashboard");
        } else if (userRole === "COMPANY_OWNER" || userRole === "RECRUITER") {
          setRole("company");
          showToast("Authenticated", "MFA Verification successful.", "success");
          setCurrentRoute("company-dashboard");
        } else {
          setRole("candidate");
          showToast("Authenticated", "MFA Verification successful.", "success");
          setCurrentRoute("dashboard");
        }
        return;
      }

      // Step 1: Initial Login
      if (!identifier || !password) {
        showToast("Missing Credentials", "Please enter your email and password.", "warning");
        return;
      }

      const endpoint = initialPortal === 'candidate' ? '/auth/login' : '/management/auth/login';
      const response = await apiClient.post(endpoint, {
        email: identifier,
        password,
      });

      const data = response.data.data;

      // Handle MFA Challenge
      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(data.mfaToken);
        showToast(
          "MFA Required",
          "Please enter the 6-digit code from your authenticator app.",
          "info",
        );
        return; // Wait for user to input MFA code
      }

      // If no MFA required, proceed directly
      const user = data.user;
      const accessToken = data.tokens?.accessToken;
      if (accessToken) setAccessToken(accessToken);
      useAuthStore.getState().setAuth(user, accessToken || "");
      
      setUserProfile(user);
      
      // Navigate to correct portal based on role
      const userRole = user.role;
      if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
        setRole("admin");
        showToast("Super Admin Session Active", "Authenticated to ops.microintern.com", "success");
        setCurrentRoute("admin-dashboard");
      } else if (userRole === "COMPANY_OWNER" || userRole === "RECRUITER") {
        setRole("company");
        showToast("Enterprise Session Active", "Authenticated to enterprise.microintern.com", "success");
        setCurrentRoute("company-dashboard");
      } else {
        setRole("candidate");
        showToast("Candidate Session Active", "Authenticated to app.microintern.com", "success");
        setCurrentRoute("dashboard");
      }
    } catch (err: any) {
      showToast(
        "Authentication Failed",
        err.message || "Invalid credentials or network error.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Get login options
      const optionsResponse = await apiClient.post(
        "/auth/webauthn/login/generate",
        {},
        {
          headers: { Authorization: `Bearer ${mfaToken}` },
        },
      );
      const options = optionsResponse.data.data;

      // 2. Prompt user
      const authenticationResponse = await startAuthentication({ optionsJSON: options });

      // 3. Verify
      const verifyResponse = await apiClient.post(
        "/auth/webauthn/login/verify",
        authenticationResponse,
        {
          headers: { Authorization: `Bearer ${mfaToken}` },
        },
      );

      const user = verifyResponse.data.data.user;
      const accessToken = verifyResponse.data.data.accessToken;
      if (accessToken) setAccessToken(accessToken);
      useAuthStore.getState().setAuth(user, accessToken || "");

      setUserProfile(user);
      setRole("admin");
      showToast("Passkey Authenticated", "Secure WebAuthn login successful.", "success");
      setCurrentRoute("admin-dashboard");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        showToast("Cancelled", "Passkey login was cancelled.", "info");
      } else {
        showToast("Authentication Failed", err.message || "Passkey verification failed.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail || !modalPassword) return;

    try {
      setModalLoading(true);

      // Handle MFA if Super Admin
      if (activeModal === "superadmin" && modalMfa) {
         // for simplicity in shortcut, if they provide mfa we assume they have the token from a previous failed attempt
         // In a real app we'd split it like the main form.
      }

      const endpoint = '/management/auth/login';
      const response = await apiClient.post(endpoint, {
        email: modalEmail,
        password: modalPassword,
      });

      const data = response.data.data;
      if (data.mfaRequired) {
         showToast("MFA Required", "This shortcut does not support 2FA flow yet. Please use main form.", "warning");
         return;
      }

      const user = data.user;
      const accessToken = data.tokens?.accessToken;
      if (accessToken) setAccessToken(accessToken);
      useAuthStore.getState().setAuth(user, accessToken || "");
      
      setUserProfile(user);
      setActiveModal("none");
      
      const userRole = user.role;
      if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
        setRole("admin");
        showToast("Super Admin Session Active", "Authenticated to ops.microintern.com", "success");
        setCurrentRoute("admin-dashboard");
      } else if (userRole === "COMPANY_OWNER" || userRole === "RECRUITER") {
        setRole("company");
        showToast("Enterprise Session Active", "Authenticated to enterprise.microintern.com", "success");
        setCurrentRoute("company-dashboard");
      } else {
        setRole("candidate");
        showToast("Candidate Session Active", "Authenticated to app.microintern.com", "success");
        setCurrentRoute("dashboard");
      }
    } catch (err: any) {
      showToast(
        "Authentication Failed",
        err.message || "Invalid credentials or network error.",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    if (initialPortal !== "candidate") {
      showToast(
        "Unauthorized Access",
        "Social OAuth is only permitted on the Candidate Portal (app.microintern.com).",
        "warning",
      );
      return;
    }
    const API_URL =
      process.env["NEXT_PUBLIC_API_URL"] || "https://micro-intern-4stz.onrender.com/api/v1";
    window.location.href = `${API_URL}/auth/${provider.toLowerCase()}`;
  };

  const isFormValid = identifier.trim().length > 0 && password.trim().length > 0;

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans select-none transition-colors duration-300 ${
        darkMode ? "bg-[#0E0E0E] text-white" : "bg-[#FAFAFA] text-black"
      }`}
    >
      {/* ── Sparse Ambient Dot Matrix Background (Nothing Style) ────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: darkMode
            ? "radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, transparent 1.5px)"
            : "radial-gradient(circle, rgba(0,0,0,0.25) 1.5px, transparent 1.5px)",
          backgroundSize: "100px 100px",
          backgroundPosition: "center center",
        }}
      />

      {/* ── Top Left Back Button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setCurrentRoute("landing")}
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
          darkMode
            ? "bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-sm"
            : "bg-black/5 hover:bg-black/10 text-black border border-black/10 shadow-sm"
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      {/* ── Top Right Theme Toggle Pill ────────────────────────────── */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-all cursor-pointer border ${
            darkMode
              ? "bg-white/10 hover:bg-white/15 text-white border-white/15 shadow-sm"
              : "bg-black/5 hover:bg-black/10 text-black border-black/10 shadow-sm"
          }`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Main Authentication Card ────────────────────────────────── */}
      <div
        className={`relative z-10 w-full max-w-[420px] rounded-[36px] p-8 sm:p-10 transition-all duration-300 shadow-2xl ${
          darkMode
            ? "bg-[#181818] border border-white/10 text-white"
            : "bg-[#EDEDE7] border border-black/[0.08] text-black"
        }`}
      >
        {/* ── Portal Title & Subtitle (Clean & Strict Architecture) ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-normal tracking-tight mb-1.5">
            {initialPortal === "candidate" && "Sign in"}
            {initialPortal === "enterprise" && "Enterprise Login"}
            {initialPortal === "ops" && "System-Ops Login"}
          </h1>
          <p className="text-xs opacity-65 font-mono">
            {initialPortal === "candidate" && "app.microintern.com • Candidate Portal"}
            {initialPortal === "enterprise" &&
              "enterprise.microintern.com • Shared Enterprise Access"}
            {initialPortal === "ops" &&
              "ops.microintern.com • Super Admin Governance (/system-ops)"}
          </p>
        </div>

        {/* ── Zero-Trust Middleware Notice (For Private Routes Only) ── */}
        {initialPortal === "enterprise" && (
          <div className="mb-5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs">
            <p className="font-bold text-purple-600 dark:text-purple-300 mb-0.5">
              🏢 Corporate Email Access
            </p>
            <p className="opacity-80 text-[11px] leading-relaxed">
              Company Admins and Recruiters share this login page. The backend detects your role
              automatically. Recruiters cannot self-register.
            </p>
          </div>
        )}

        {initialPortal === "ops" && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <p className="font-bold text-amber-600 dark:text-amber-400 font-mono mb-0.5">
              🔒 ZERO-TRUST SECURITY ENFORCED
            </p>
            <p className="opacity-80 text-[11px] leading-relaxed">
              This route is private. 5-stage middleware verifies Auth, Role, Tenant, MFA, and Device
              Trust. Unauthorized attempts return 403 Forbidden.
            </p>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-3">
          {/* If MFA is required, we hide the password field and show the MFA input instead */}
          {!mfaRequired && (
            <>
              {/* Email Address */}
              <div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    initialPortal === "candidate"
                      ? "Candidate Email Address"
                      : initialPortal === "enterprise"
                        ? "Corporate Work Email (e.g., admin@google.com)"
                        : "Platform Owner Email Address"
                  }
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none border ${
                    darkMode
                      ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                      : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                  }`}
                />
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className={`w-full px-4 py-3.5 pr-14 rounded-2xl text-sm transition-all focus:outline-none border ${
                    darkMode
                      ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                      : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                    darkMode
                      ? "text-white bg-white/15 hover:bg-white/25 border border-white/20 shadow-sm"
                      : "text-black bg-black/10 hover:bg-black/15 border border-black/10 shadow-sm"
                  }`}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}

          {/* Mandatory MFA Code Input */}
          {initialPortal === "ops" && mfaRequired && (
            <div className="pt-1 space-y-4">
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-Digit MFA Token"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-mono tracking-widest transition-all focus:outline-none border ${
                  darkMode
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 placeholder:text-amber-400/50"
                    : "bg-amber-50 border-amber-600/30 text-amber-900 placeholder:text-amber-700/50"
                }`}
              />

              <div className="flex items-center justify-between text-xs text-black/50 dark:text-white/50">
                <div className="w-full h-px bg-black/10 dark:bg-white/10" />
                <span className="px-4">OR</span>
                <div className="w-full h-px bg-black/10 dark:bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleWebAuthnLogin}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all border ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-black/5 border-black/10 text-black hover:bg-black/10"
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                Use Hardware Key / Passkey
              </button>
            </div>
          )}

          {/* Forgot Password Link */}
          {!mfaRequired && (
            <div className="pt-1 pb-1 text-center">
              <button
                type="button"
                onClick={() => setCurrentRoute("forgot-password")}
                className={`text-xs font-semibold hover:underline cursor-pointer ${
                  darkMode ? "text-white/80 hover:text-white" : "text-black"
                }`}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* ── Sign In Pill + Circular White Social Buttons Row ────── */}
          <div className="flex items-center gap-2 pt-2">
            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isFormValid
                  ? darkMode
                    ? "bg-white hover:bg-gray-100 text-black shadow-md"
                    : "bg-[#111111] hover:bg-[#2A2A2A] text-white shadow-md"
                  : darkMode
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
              <span>{isLoading ? "Signing in..." : mfaRequired ? "Verify MFA" : "Sign in"}</span>
            </button>

            {/* Social OAuth Icons (ONLY for Candidate Portal - app.microintern.com) */}
            {initialPortal === "candidate" && (
              <>
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth("Google")}
                  className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-black shadow-sm shrink-0 transition-all cursor-pointer"
                  title="Continue with Google"
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
                  title="Continue with Microsoft"
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
                  title="Continue with LinkedIn"
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
                  title="Continue with GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </form>

        {/* Disclaimer Text */}
        <p
          className={`text-[11px] text-center leading-relaxed my-6 px-4 transition-colors ${
            darkMode ? "text-white/60" : "text-[#7A7A7A]"
          }`}
        >
          By signing in, you agree to our{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrivacyModal(true);
            }}
            className={`font-semibold underline hover:opacity-80 cursor-pointer ${
              darkMode ? "text-white" : "text-black"
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
              setShowAgreementModal(true);
            }}
            className={`font-semibold underline hover:opacity-80 cursor-pointer ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            User Agreement
          </button>
          .
        </p>

        {/* ── Candidate Self-Registration (ONLY for Candidate Portal) ── */}
        {initialPortal === "candidate" && (
          <button
            type="button"
            onClick={() => setCurrentRoute("signup")}
            className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer block text-center shadow-sm ${
              darkMode
                ? "bg-white hover:bg-gray-100 text-black"
                : "bg-[#111111] hover:bg-[#2A2A2A] text-white"
            }`}
          >
            Create an account
          </button>
        )}
      </div>

      {/* ── HIDDEN SHORTCUT PRIVATE MODALS (CTRL+SHIFT+R | A | S on /login) ── */}
      {activeModal !== "none" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModal("none")}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className={`relative rounded-[32px] shadow-2xl w-full max-w-[420px] p-8 border ${
              darkMode
                ? "bg-[#181818] text-white border-white/15"
                : "bg-white text-black border-black/15"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {activeModal === "recruiter" && <UserCheck className="w-5 h-5 text-emerald-500" />}
                {activeModal === "company" && <Building2 className="w-5 h-5 text-purple-500" />}
                {activeModal === "superadmin" && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                <h3 className="font-serif text-xl font-normal">
                  {activeModal === "recruiter" && "Recruiter Private Login"}
                  {activeModal === "company" && "Company Admin Login"}
                  {activeModal === "superadmin" && "Super Admin Ops Login"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs opacity-70 mb-5 leading-relaxed font-mono">
              {activeModal === "recruiter" &&
                "enterprise.microintern.com • Recruiters cannot self-register."}
              {activeModal === "company" &&
                "enterprise.microintern.com • Organization eKYC Governance."}
              {activeModal === "superadmin" &&
                "ops.microintern.com • Zero-Trust MFA & IP Audit Enforced."}
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder={
                    activeModal === "superadmin"
                      ? "Platform Owner Email"
                      : "Corporate Work Email (e.g., alex@google.com)"
                  }
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none border ${
                    darkMode
                      ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                      : "bg-white border-black/20 text-black placeholder:text-black/40 focus:border-black"
                  }`}
                />
              </div>

              <div className="relative">
                <input
                  type={modalShowPassword ? "text" : "password"}
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-12 rounded-2xl text-sm transition-all focus:outline-none border ${
                    darkMode
                      ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60"
                      : "bg-white border-black/20 text-black placeholder:text-black/40 focus:border-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setModalShowPassword(!modalShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 opacity-60 hover:opacity-100"
                >
                  {modalShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {activeModal === "superadmin" && (
                <div>
                  <input
                    type="text"
                    value={modalMfa}
                    onChange={(e) => setModalMfa(e.target.value)}
                    placeholder="6-Digit MFA Token / YubiKey Hardware Token"
                    className="w-full px-4 py-3 rounded-2xl text-xs font-mono tracking-widest bg-amber-500/10 border border-amber-500/40 text-amber-300 placeholder:text-amber-400/50"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-white hover:bg-gray-100 text-black"
                      : "bg-[#111111] hover:bg-[#333333] text-white"
                  }`}
                >
                  {modalLoading ? "Authenticating..." : "Sign in to Workspace"}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-white/10 text-[10px] opacity-60 font-mono text-center">
              Backend Middleware: 403 Forbidden on Unauthorized Access
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ── */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className={`relative rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border ${
              darkMode
                ? "bg-[#1F1F1F] text-white border-white/10"
                : "bg-white text-black border-black/10"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-7 py-5 border-b ${darkMode ? "border-white/10 bg-white/5" : "border-[#E8E4D8] bg-black/5"}`}
            >
              <h2 className="text-lg font-bold">Privacy Policy</h2>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  darkMode
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
              className={`px-7 py-4 border-t ${darkMode ? "border-white/10 bg-white/5" : "border-[#E8E4D8] bg-black/5"}`}
            >
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  darkMode
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

      {/* ── User Agreement Modal ── */}
      {showAgreementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAgreementModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className={`relative rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border ${
              darkMode
                ? "bg-[#1F1F1F] text-white border-white/10"
                : "bg-white text-black border-black/10"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-7 py-5 border-b ${darkMode ? "border-white/10 bg-white/5" : "border-[#E8E4D8] bg-black/5"}`}
            >
              <h2 className="text-lg font-bold">User Agreement & Terms</h2>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  darkMode
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
                Effective Date: August 2025
              </p>
              {[
                {
                  title: "1. Platform Purpose & Eligibility",
                  body: "MicroIntern provides verified skill assessments, AI-validated certifications, and micro-internship trials for developers and engineers. Users must provide accurate profile credentials.",
                },
                {
                  title: "2. Authenticity & Original Work",
                  body: "All submissions to trials and skill showcases must represent your own authentic work. Using automated bots without disclosure or plagiarising peer submissions will result in immediate badge revocation.",
                },
                {
                  title: "3. AI Credential Verification",
                  body: "Our automated evaluation system inspects repositories, code quality, and technical completeness to assign verified Trust Scores. Scores are dynamically recalculated as you complete trials.",
                },
                {
                  title: "4. Professional Conduct",
                  body: "Users in the Professional Network and Direct Messaging must maintain courteous, respectful, and professional communication with peers and hiring partners.",
                },
                {
                  title: "5. Intellectual Property",
                  body: "You retain full ownership of code submitted to open community trials unless explicitly governed by a sponsored company agreement agreed upon before submission.",
                },
                {
                  title: "6. Limitation of Liability",
                  body: 'MicroIntern is provided "as is" without warranty of continuous uptime. We are not liable for employment outcomes between candidates and hiring companies.',
                },
              ].map((s) => (
                <div key={s.title}>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="opacity-80">{s.body}</p>
                </div>
              ))}
            </div>
            <div
              className={`px-7 py-4 border-t ${darkMode ? "border-white/10 bg-white/5" : "border-[#E8E4D8] bg-black/5"}`}
            >
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  darkMode
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-[#111111] text-white hover:bg-[#333333]"
                }`}
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
