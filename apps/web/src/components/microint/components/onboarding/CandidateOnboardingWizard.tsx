"use client";
import React, { useState, useRef } from "react";
import {
  Camera, User, MapPin, BookOpen, Link2, CheckCircle2,
  ArrowRight, ArrowLeft, X, Plus, Loader2, Sparkles,
  GraduationCap, Globe, Github, Linkedin,
} from "lucide-react";
import { candidateApi } from "../../../../lib/api/candidate";
import { authService } from "../../../../features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useApp } from "../../context/AppContext";

const STEPS = [
  { id: 1, label: "Photo", icon: Camera, title: "Add your photo", desc: "A great profile photo builds trust with companies" },
  { id: 2, label: "About", icon: User, title: "Tell us about yourself", desc: "Your headline and bio make you stand out" },
  { id: 3, label: "Skills", icon: Sparkles, title: "Showcase your skills", desc: "Help companies find you for the right opportunities" },
  { id: 4, label: "Education", icon: GraduationCap, title: "Your education background", desc: "Share where you studied" },
  { id: 5, label: "Socials", icon: Link2, title: "Connect your profiles", desc: "LinkedIn, GitHub, portfolio — make it easy to verify you" },
];

const SKILL_SUGGESTIONS = [
  "JavaScript","TypeScript","React","Node.js","Python","Java","C++","Go",
  "SQL","PostgreSQL","MongoDB","Redis","Docker","Kubernetes","AWS","GCP",
  "Machine Learning","Data Analysis","Figma","UI/UX Design","Next.js","Vue",
  "Angular","GraphQL","REST APIs","Git","Agile","Product Management",
];

const DEGREE_OPTIONS = [
  "Bachelor's","Master's","PhD","Associate's","High School Diploma","Bootcamp / Certificate","Self-taught",
];

interface FormData {
  avatarFile: File | null;
  avatarPreview: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  college: string;
  degree: string;
  graduationYear: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

const initialForm: FormData = {
  avatarFile: null, avatarPreview: "",
  headline: "", bio: "", location: "",
  skills: [],
  college: "", degree: "", graduationYear: "",
  linkedinUrl: "", githubUrl: "", portfolioUrl: "",
};

export const CandidateOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useAuthStore();
  const { setCurrentRoute, showToast } = useApp();

  const currentStep = STEPS[step - 1];
  if (!currentStep) return null;

  const progress = (step / STEPS.length) * 100;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, avatarFile: file, avatarPreview: URL.createObjectURL(file) }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || form.skills.includes(trimmed) || form.skills.length >= 15) return;
    setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const saveStep = async () => {
    setSaving(true);
    try {
      if (step === 1 && form.avatarFile) {
        const { url } = await candidateApi.uploadAvatar(form.avatarFile);
        updateUser({ avatarUrl: url });
      }
      if (step === 2) {
        const payload: Record<string, unknown> = {};
        if (form["headline"]) payload["headline"] = form["headline"];
        if (form["bio"]) payload["bio"] = form["bio"];
        if (form["location"]) payload["location"] = form["location"];
        if (Object.keys(payload).length) await candidateApi.updateProfile(payload as any);
      }
      if (step === 3 && form.skills.length > 0) {
        await candidateApi.updateProfile({
          skills: form.skills.map((name) => ({ name, proficiencyLevel: "INTERMEDIATE" })),
        } as any);
      }
      if (step === 4 && (form.college || form.degree)) {
        await candidateApi.updateProfile({
          educations: [{
            institution: form.college, degree: form.degree, fieldOfStudy: "",
            startYear: 2020,
            endYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            isCurrent: false,
          }],
        } as any);
      }
      if (step === 5) {
        const socials = [];
        if (form.linkedinUrl) socials.push({ platform: "LINKEDIN", url: form.linkedinUrl });
        if (form.githubUrl) socials.push({ platform: "GITHUB", url: form.githubUrl });
        if (form.portfolioUrl) socials.push({ platform: "PORTFOLIO", url: form.portfolioUrl });
        if (socials.length) await candidateApi.updateProfile({ socials } as any);
      }
    } catch { /* non-critical */ }
    finally { setSaving(false); }
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      await authService.completeOnboarding();
      updateUser({ isOnboarded: true });
      setDone(true);
      setTimeout(() => setCurrentRoute("dashboard"), 2000);
    } catch {
      showToast("Notice", "You're all set!", "info");
      setCurrentRoute("dashboard");
    } finally { setSaving(false); }
  };

  const handleNext = async () => {
    await saveStep();
    if (step < STEPS.length) setStep((s) => s + 1);
    else await finishOnboarding();
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">You&apos;re all set! 🎉</h2>
          <p className="text-white/60">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#08080a] text-white overflow-hidden">
      {/* Left sidebar — steps */}
      <div className="hidden lg:flex flex-col w-72 bg-white/[0.03] border-r border-white/10 p-8 justify-between">
        <div>
          <div className="mb-10">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              MicroIntern
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-6">Set up your profile</p>
          <nav className="space-y-2">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isDone = s.id < step;
              const isCurrent = s.id === step;
              return (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? "bg-white/10" : isDone ? "opacity-60" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-violet-500" : isCurrent ? "bg-white/15" : "bg-white/5"}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 text-white/70" />}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? "text-white" : "text-white/50"}`}>{s.label}</span>
                </div>
              );
            })}
          </nav>
        </div>
        <p className="text-xs text-white/20">You can update these anytime in your profile settings.</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="h-1 bg-white/10 flex-shrink-0">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
          <div className="text-center mb-8 w-full">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-7 h-7 text-violet-400" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">Step {step} of {STEPS.length}</div>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentStep.title}</h1>
            <p className="mt-2 text-sm text-white/40">{currentStep.desc}</p>
          </div>

          {/* Step 1: Avatar */}
          {step === 1 && (
            <div className="w-full flex flex-col items-center gap-5">
              <button onClick={() => fileInputRef.current?.click()} className="relative group w-36 h-36 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-violet-500/60 transition-all">
                {form.avatarPreview
                  ? <img src={form.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-2 group-hover:bg-violet-500/10 transition-all">
                      <Camera className="w-8 h-8 text-white/30 group-hover:text-violet-400 transition-colors" />
                      <span className="text-xs text-white/30">Upload photo</span>
                    </div>
                }
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              {form.avatarPreview && (
                <button onClick={() => setForm((f) => ({ ...f, avatarFile: null, avatarPreview: "" }))} className="text-xs text-white/40 hover:text-red-400 transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
              <p className="text-xs text-white/30">JPG, PNG, WebP up to 5MB</p>
            </div>
          )}

          {/* Step 2: About */}
          {step === 2 && (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Headline</label>
                <input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} placeholder="e.g. Final year CS student passionate about AI" maxLength={120} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell companies about yourself…" rows={4} maxLength={500} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all resize-none" />
                <p className="text-right text-xs text-white/20 mt-1">{form.bio.length}/500</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" />Location</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Hyderabad, India" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all" />
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="w-full space-y-4">
              <div className="flex gap-2">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} placeholder="Type a skill and press Enter" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all" />
                <button onClick={() => addSkill(skillInput)} className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/30">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-white/30 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 16).map((s) => (
                    <button key={s} onClick={() => addSkill(s)} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/50 hover:bg-violet-500/15 hover:border-violet-500/30 hover:text-violet-300 transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/20">{form.skills.length}/15 skills</p>
            </div>
          )}

          {/* Step 4: Education */}
          {step === 4 && (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">University / College</label>
                <input value={form.college} onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))} placeholder="e.g. IIT Bombay" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Degree</label>
                <select value={form.degree} onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))} className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 transition-all">
                  <option value="">Select degree type</option>
                  {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Graduation Year</label>
                <input type="number" value={form.graduationYear} onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))} placeholder="e.g. 2026" min={1990} max={2035} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 transition-all" />
              </div>
            </div>
          )}

          {/* Step 5: Socials */}
          {step === 5 && (
            <div className="w-full space-y-4">
              {[
                { icon: Linkedin, placeholder: "https://linkedin.com/in/yourhandle", key: "linkedinUrl", color: "text-[#0A66C2]" },
                { icon: Github, placeholder: "https://github.com/yourhandle", key: "githubUrl", color: "text-white" },
                { icon: Globe, placeholder: "https://yourportfolio.com", key: "portfolioUrl", color: "text-violet-400" },
              ].map(({ icon: Icon, placeholder, key, color }) => (
                <div key={key} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/60 transition-all">
                  <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
              ))}
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
              <button onClick={handleNext} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : step === STEPS.length ? <><CheckCircle2 className="w-4 h-4" /> Finish</>
                  : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>

          {/* Mobile dots */}
          <div className="flex lg:hidden items-center gap-1.5 mt-6">
            {STEPS.map((s) => (
              <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${s.id === step ? "w-6 bg-violet-500" : s.id < step ? "w-4 bg-violet-500/40" : "w-4 bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
