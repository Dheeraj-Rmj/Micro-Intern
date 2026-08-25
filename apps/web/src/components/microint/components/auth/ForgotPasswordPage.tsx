"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ArrowLeft, CheckCircle2, Sun, Moon } from "lucide-react";
import { authService } from "../../../../features/auth/services/auth.service";

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentRoute, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Invalid Email", "Please provide a valid account email.", "warning");
      return;
    }
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setIsSent(true);
      showToast("OTP Sent", "Check your inbox for the 6-digit password recovery code.", "success");
    } catch (err: any) {
      showToast("Error", err.message || "Failed to send reset code.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      showToast("Invalid OTP", "Please enter a valid 6-digit code.", "warning");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Invalid Password", "Password must be at least 8 characters long.", "warning");
      return;
    }
    try {
      setIsLoading(true);
      await authService.resetPassword({ token: otp, password: newPassword });
      setIsSuccess(true);
      showToast("Success", "Your password has been reset.", "success");
      setTimeout(() => {
        setCurrentRoute("signin");
      }, 2000);
    } catch (err: any) {
      showToast("Error", err.message || "Failed to reset password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim().length > 0 && email.includes("@");
  const isOtpFormValid = otp.length === 6 && newPassword.length >= 8;

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans select-none transition-colors duration-300 ${
        isDark ? "bg-[#0E0E0E] text-white" : "bg-[#FAFAFA] text-black"
      }`}
    >
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

      <div
        className={`absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[11px] font-mono tracking-[0.3em] uppercase select-none z-10 pointer-events-none whitespace-nowrap transition-colors duration-300 ${
          isDark ? "text-white/50" : "text-black/60"
        }`}
      >
        MICRO INTERN
      </div>

      <div
        className={`w-full max-w-[440px] rounded-[32px] p-8 md:p-10 shadow-2xl relative z-20 my-auto transition-colors duration-300 ${
          isDark ? "bg-[#262626] text-white" : "bg-[#EDEDE7] border border-black/[0.08] text-black"
        }`}
      >
        <h1 className="text-3xl font-serif font-normal tracking-tight mb-2">Forgot password</h1>
        <p
          className={`text-xs mb-7 leading-relaxed ${isDark ? "text-white/60" : "text-[#6E6E6E]"}`}
        >
          {isSuccess
            ? "Your password was successfully reset."
            : isSent
              ? "Enter the 6-digit code sent to your email and your new password."
              : "Enter your registered email address to receive a 6-digit recovery code."}
        </p>

        {isSuccess ? (
           <div className="py-4 space-y-5 text-center">
             <div
               className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                 isDark ? "bg-white/10 text-white" : "bg-[#F0F0F0] text-black"
               }`}
             >
               <CheckCircle2 className="w-7 h-7" />
             </div>
             <div>
               <h3 className="text-lg font-bold mb-1">Password Reset!</h3>
               <p
                 className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-[#6E6E6E]"}`}
               >
                 You will be redirected to the sign in page momentarily.
               </p>
             </div>
           </div>
        ) : isSent ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className={`w-full px-4 py-3.5 rounded-2xl text-sm transition-all text-center tracking-widest font-mono focus:outline-none border ${
                  isDark
                    ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                    : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                }`}
              />
            </div>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className={`w-full px-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none border ${
                  isDark
                    ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                    : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                }`}
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isOtpFormValid
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                <span>{isLoading ? "Verifying..." : "Reset Password"}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={`w-full px-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none border ${
                  isDark
                    ? "bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]"
                    : "bg-white/60 border-black/15 text-black placeholder:text-black/40 focus:border-black focus:bg-white"
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                <span>{isLoading ? "Sending code..." : "Send code"}</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={() => setCurrentRoute("signin")}
            className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer block text-center shadow-sm ${
              isDark
                ? "bg-white hover:bg-gray-100 text-black"
                : "bg-[#111111] hover:bg-[#2A2A2A] text-white"
            }`}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};
