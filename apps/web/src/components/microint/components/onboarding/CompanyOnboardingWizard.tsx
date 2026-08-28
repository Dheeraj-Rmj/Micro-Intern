"use client";
import React, { useState, useRef } from "react";
import {
  Building2, Users, CheckCircle2, ArrowRight, ArrowLeft,
  Loader2, Globe, Mail, Plus, X, Send, Trash2,
} from "lucide-react";
import { companyApi } from "../../../../lib/api/company";
import { authService } from "../../../../features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useApp } from "../../context/AppContext";

const STEPS = [
  { id: 1, label: "Company", icon: Building2, title: "Set up your company", desc: "Tell candidates who you are" },
  { id: 2, label: "Recruiters", icon: Users, title: "Add your recruiters", desc: "Invite team members to manage hiring" },
];

const INDUSTRY_OPTIONS = [
  "Software / Tech","FinTech","EdTech","HealthTech","E-Commerce","AI / ML",
  "Consulting","Cybersecurity","Gaming","Media & Entertainment",
  "Manufacturing","Logistics","Real Estate","Other",
];

const COMPANY_SIZE_OPTIONS = ["1–10","11–50","51–200","201–500","501–1000","1000+"];

interface CompanyForm {
  website: string;
  industry: string;
  companySize: string;
  headquarters: string;
  description: string;
}

interface RecruiterInvite {
  email: string;
  status: "pending" | "sending" | "sent" | "error";
  error?: string;
}

export const CompanyOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CompanyForm>({ website: "", industry: "", companySize: "", headquarters: "", description: "" });
  const [invites, setInvites] = useState<RecruiterInvite[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const { updateUser, user } = useAuthStore();
  const { setCurrentRoute, showToast } = useApp();

  const progress = (step / STEPS.length) * 100;

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (invites.some((i) => i.email === email)) return;
    setInvites((prev) => [...prev, { email, status: "pending" }]);
    setEmailInput("");
  };

  const removeInvite = (email: string) => setInvites((prev) => prev.filter((i) => i.email !== email));

  const sendInvites = async () => {
    const pending = invites.filter((i) => i.status === "pending");
    for (const invite of pending) {
      setInvites((prev) => prev.map((i) => i.email === invite.email ? { ...i, status: "sending" } : i));
      try {
        await companyApi.inviteMember(invite.email, "RECRUITER");
        setInvites((prev) => prev.map((i) => i.email === invite.email ? { ...i, status: "sent" } : i));
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || "Failed to send";
        setInvites((prev) => prev.map((i) => i.email === invite.email ? { ...i, status: "error", error: msg } : i));
      }
    }
  };

  const saveStep1 = async () => {
    // Try to update company profile — may not exist yet for all backends
    try {
      const payload: Record<string, unknown> = {};
      if (form.website) payload.website = form.website;
      if (form.industry) payload.industry = form.industry;
      if (form.companySize) payload.companySize = form.companySize;
      if (form.headquarters) payload.headquarters = form.headquarters;
      if (form.description) payload.description = form.description;
      if (Object.keys(payload).length) {
        // updateCompany endpoint — best effort
        await (companyApi as any).updateCompany?.(payload);
      }
    } catch { /* non-critical */ }
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      if (invites.some((i) => i.status === "pending")) await sendInvites();
      await authService.completeOnboarding();
      updateUser({ isOnboarded: true });
      setDone(true);
      setTimeout(() => setCurrentRoute("company-dashboard"), 2000);
    } catch {
      showToast("Notice", "You're all set!", "info");
      setCurrentRoute("company-dashboard");
    } finally { setSaving(false); }
  };

  const handleNext = async () => {
    if (step === 1) {
      setSaving(true);
      await saveStep1();
      setSaving(false);
      setStep(2);
    } else {
      await finishOnboarding();
    }
  };

  const handleSkip = async () => {
    if (step === STEPS.length) await finishOnboarding();
    else setStep((s) => s + 1);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Company ready! 🚀</h2>
          <p className="text-white/60">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#08080a] text-white overflow-hidden">
      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white/[0.03] border-r border-white/10 p-8 justify-between">
        <div>
          <div className="mb-10">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">MicroIntern</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-6">Company setup</p>
          <nav className="space-y-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = s.id < step;
              const isCurrent = s.id === step;
              return (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? "bg-white/10" : isDone ? "opacity-60" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-500" : isCurrent ? "bg-white/15" : "bg-white/5"}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 text-white/70" />}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? "text-white" : "text-white/50"}`}>{s.label}</span>
                </div>
              );
            })}
          </nav>

          {/* Company name display */}
          {user && (
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/40 mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
            </div>
          )}
        </div>
        <p className="text-xs text-white/20">Company details can be updated in settings.</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="h-1 bg-white/10 flex-shrink-0">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
          <div className="text-center mb-8 w-full">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">Step {step} of {STEPS.length}</div>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentStep.title}</h1>
            <p className="mt-2 text-sm text-white/40">{currentStep.desc}</p>
          </div>

          {/* Step 1: Company info */}
          {step === 1 && (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3 h-3" />Website</label>
                <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://yourcompany.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/60 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Industry</label>
                  <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-all">
                    <option value="">Select…</option>
                    {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Company size</label>
                  <select value={form.companySize} onChange={(e) => setForm((f) => ({ ...f, companySize: e.target.value }))} className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-all">
                    <option value="">Select…</option>
                    {COMPANY_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Headquarters</label>
                <input value={form.headquarters} onChange={(e) => setForm((f) => ({ ...f, headquarters: e.target.value }))} placeholder="e.g. Hyderabad, India" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">About your company</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does your company do? What makes you a great place to work?" rows={4} maxLength={600} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/60 transition-all resize-none" />
                <p className="text-right text-xs text-white/20 mt-1">{form.description.length}/600</p>
              </div>
            </div>
          )}

          {/* Step 2: Recruiter invites */}
          {step === 2 && (
            <div className="w-full space-y-5">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-500/60 transition-all">
                  <Mail className="w-4 h-4 text-white/30 flex-shrink-0" />
                  <input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                    placeholder="recruiter@company.com"
                    type="email"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <button onClick={addEmail} className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {invites.length > 0 && (
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div key={invite.email} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      invite.status === "sent" ? "bg-emerald-500/10 border-emerald-500/30"
                      : invite.status === "error" ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/5 border-white/10"
                    }`}>
                      <Mail className={`w-4 h-4 flex-shrink-0 ${invite.status === "sent" ? "text-emerald-400" : invite.status === "error" ? "text-red-400" : "text-white/40"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{invite.email}</p>
                        {invite.status === "error" && <p className="text-xs text-red-400 mt-0.5">{invite.error}</p>}
                        {invite.status === "sent" && <p className="text-xs text-emerald-400 mt-0.5">Invite sent!</p>}
                        {invite.status === "sending" && <p className="text-xs text-white/30 mt-0.5">Sending…</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {invite.status === "sent" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {invite.status === "sending" && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
                        {(invite.status === "pending" || invite.status === "error") && (
                          <button onClick={() => removeInvite(invite.email)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {invites.some((i) => i.status === "pending") && (
                <button onClick={sendInvites} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/10 transition-all">
                  <Send className="w-4 h-4" /> Send invites
                </button>
              )}

              {invites.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">Add recruiter email addresses above</p>
                  <p className="text-xs text-white/20 mt-1">You can also invite them later from Company Settings</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="w-full mt-8 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 disabled:opacity-0 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleSkip} disabled={saving} className="px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 transition-all disabled:opacity-50">
                {step === STEPS.length ? "Skip & finish" : "Skip"}
              </button>
              <button onClick={handleNext} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : step === STEPS.length ? <><CheckCircle2 className="w-4 h-4" /> Finish setup</>
                  : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>

          {/* Mobile dots */}
          <div className="flex lg:hidden items-center gap-1.5 mt-6">
            {STEPS.map((s) => (
              <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${s.id === step ? "w-6 bg-emerald-500" : s.id < step ? "w-4 bg-emerald-500/40" : "w-4 bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
