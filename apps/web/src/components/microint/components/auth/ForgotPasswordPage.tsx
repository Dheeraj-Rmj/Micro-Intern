'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, CheckCircle2, Sun, Moon } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentRoute, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Invalid Email', 'Please provide a valid account email.', 'warning');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    setIsSent(true);
    showToast('Reset Link Sent', 'Check your inbox for password recovery instructions.', 'success');
  };

  const isFormValid = email.trim().length > 0 && email.includes('@');

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans select-none transition-colors duration-300 ${
        isDark ? 'bg-[#0E0E0E] text-white' : 'bg-[#F3F2EA] text-[#111111]'
      }`}
    >
      {/* ── Sparse Ambient Dot Matrix Background (Nothing Style) ────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, transparent 1.5px)'
            : 'radial-gradient(circle, rgba(0,0,0,0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
        }}
      />

      {/* ── Top Left Back Button ────────────────────────────────────── */}
      <button
        onClick={() => setCurrentRoute('landing')}
        className={`absolute top-6 left-6 w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer z-20 ${
          isDark
            ? 'bg-[#262626] hover:bg-[#333333] text-white'
            : 'bg-white hover:bg-[#EAEAEA] text-[#111111] border border-black/10'
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
              ? 'bg-[#262626] hover:bg-[#333333] text-white'
              : 'bg-white hover:bg-[#EAEAEA] text-[#111111] border border-black/10'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Vertical Left Brand Text ────────────────────────────────── */}
      <div
        className={`absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[11px] font-mono tracking-[0.3em] uppercase select-none z-10 pointer-events-none whitespace-nowrap transition-colors duration-300 ${
          isDark ? 'text-white/50' : 'text-[#111111]/60'
        }`}
      >
        MICRO INTERN
      </div>

      {/* ── Center Auth Card (1:1 Nothing Account Clone) ────────────── */}
      <div
        className={`w-full max-w-[440px] rounded-[32px] p-8 md:p-10 shadow-2xl relative z-20 my-auto transition-colors duration-300 ${
          isDark
            ? 'bg-[#262626] text-white'
            : 'bg-[#EDEDE7] border border-black/[0.08] text-[#111111]'
        }`}
      >
        <h1 className="text-3xl font-serif font-normal tracking-tight mb-2">Forgot password</h1>
        <p className={`text-xs mb-7 leading-relaxed ${isDark ? 'text-white/60' : 'text-[#6E6E6E]'}`}>
          Enter your registered email address to receive password reset instructions.
        </p>

        {isSent ? (
          <div className="py-4 space-y-5 text-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                isDark ? 'bg-white/10 text-white' : 'bg-[#F0F0F0] text-[#111111]'
              }`}
            >
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Reset link sent</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-[#6E6E6E]'}`}>
                We sent a password recovery link to{' '}
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#111111]'}`}>{email}</span>. Check your
                inbox or spam folder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className={`text-xs font-semibold hover:underline cursor-pointer block mx-auto ${
                isDark ? 'text-white' : 'text-[#111111]'
              }`}
            >
              Resend to another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={`w-full px-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none border ${
                  isDark
                    ? 'bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/[0.03]'
                    : 'bg-white/60 border-black/15 text-[#111111] placeholder:text-[#111111]/40 focus:border-black focus:bg-white'
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
                      ? 'bg-white hover:bg-gray-100 text-black shadow-md'
                      : 'bg-[#111111] hover:bg-[#2A2A2A] text-white shadow-md'
                    : isDark
                      ? 'bg-white/15 text-white/40 cursor-not-allowed'
                      : 'bg-black/15 text-black/40 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                <span>{isLoading ? 'Sending reset link...' : 'Send reset link'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Back to Sign In Toggle Button (Prominent White Pill at Bottom) */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setCurrentRoute('signin')}
            className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer block text-center shadow-sm ${
              isDark
                ? 'bg-white hover:bg-gray-100 text-black'
                : 'bg-[#111111] hover:bg-[#2A2A2A] text-white'
            }`}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};
