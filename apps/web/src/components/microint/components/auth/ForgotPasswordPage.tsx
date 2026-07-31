'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentRoute, showToast } = useApp();
  const [email, setEmail] = useState('alex.vance@university.edu');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Invalid Email', 'Please provide a valid account email.', 'warning');
      return;
    }
    setIsSent(true);
    showToast('Reset Link Sent', 'Check your inbox for password recovery instructions.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-md mx-auto w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <button
            onClick={() => setCurrentRoute('landing')}
            className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>MICROINTERN</span>
          </button>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Enter your registered candidate email to receive password reset instructions.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-6 sm:p-8">
          {isSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Instructions Sent!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We sent a password recovery link to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. Please check your spam folder if you don&apos;t see it within 2 minutes.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline block mx-auto cursor-pointer"
              >
                Resend to another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Send Reset Link</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setCurrentRoute('signin')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
