'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  User,
  Upload,
  Save,
  X,
  FileText,
  Globe,
  Github,
  Linkedin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

// Zod validation schema for Candidate Profile form
const profileSchema = z.object({
  headline: z
    .string()
    .min(2, 'Headline must be at least 2 characters')
    .max(120, 'Headline must be under 120 characters'),
  bio: z
    .string()
    .max(1000, 'Bio must be under 1000 characters')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string())
    .max(20, 'You can add up to 20 skills maximum'),
  githubUrl: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/?$/i.test(val) || /^https?:\/\/[^\s]+$/i.test(val),
      { message: 'Please enter a valid GitHub profile URL (e.g. https://github.com/username)' }
    )
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+\/?$/i.test(val) || /^https?:\/\/[^\s]+$/i.test(val),
      { message: 'Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)' }
    )
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(val),
      { message: 'Please enter a valid URL (e.g. https://myportfolio.com)' }
    )
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { userProfile, setUserProfile, showToast } = useApp();

  // Local state for file previews and error feedback
  const [avatarPreview, setAvatarPreview] = useState<string>(userProfile.avatar || '');
  const [resumeName, setResumeName] = useState<string>(userProfile.resumeFileName || '');
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarDragOver, setAvatarDragOver] = useState<boolean>(false);
  const [resumeDragOver, setResumeDragOver] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: userProfile.headline || userProfile.experienceYears || 'Full Stack Engineer & Solution Architect',
      bio: userProfile.bio || userProfile.aboutMe || '',
      skills: userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      githubUrl: userProfile.githubUrl || '',
      linkedinUrl: userProfile.linkedinUrl || '',
      portfolioUrl: userProfile.portfolioUrl || '',
    },
  });

  const currentSkills = watch('skills') || [];

  // Update form defaults when userProfile changes
  useEffect(() => {
    reset({
      headline: userProfile.headline || userProfile.experienceYears || 'Full Stack Engineer & Solution Architect',
      bio: userProfile.bio || userProfile.aboutMe || '',
      skills: userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      githubUrl: userProfile.githubUrl || '',
      linkedinUrl: userProfile.linkedinUrl || '',
      portfolioUrl: userProfile.portfolioUrl || '',
    });
    setAvatarPreview(userProfile.avatar || '');
    setResumeName(userProfile.resumeFileName || '');
  }, [userProfile, reset]);

  // Handle Avatar validation & drag-and-drop
  const validateAndProcessAvatar = (file: File) => {
    setAvatarError(null);
    if (!file.type.startsWith('image/')) {
      const err = 'Invalid file format. Please upload an image file (JPG, PNG, WebP, GIF).';
      setAvatarError(err);
      showToast('Avatar Error', err, 'warning');
      return;
    }
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_AVATAR_SIZE) {
      const err = `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
      setAvatarError(err);
      showToast('Avatar Error', err, 'warning');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    showToast('Avatar Preview Ready', `Uploaded ${file.name} (${(file.size / 1024).toFixed(0)}KB)`, 'info');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessAvatar(file);
    }
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAvatarDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessAvatar(file);
    }
  };

  // Handle Resume validation & drag-and-drop (PDF only, max 10MB)
  const validateAndProcessResume = (file: File) => {
    setResumeError(null);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      const err = 'Invalid file format. Only PDF (.pdf) documents are accepted.';
      setResumeError(err);
      showToast('Resume Error', err, 'warning');
      return;
    }
    const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_RESUME_SIZE) {
      const err = `Resume size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
      setResumeError(err);
      showToast('Resume Error', err, 'warning');
      return;
    }

    setResumeName(file.name);
    showToast('Resume Selected', `Attached ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`, 'info');
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessResume(file);
    }
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setResumeDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessResume(file);
    }
  };

  // Skills Tag Input Handlers (Max 20 skills)
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    if (currentSkills.includes(trimmed)) {
      showToast('Duplicate Skill', `"${trimmed}" is already in your skills list.`, 'warning');
      return;
    }

    if (currentSkills.length >= 20) {
      showToast('Limit Reached', 'You can add up to 20 skills maximum.', 'warning');
      return;
    }

    const updated = [...currentSkills, trimmed];
    setValue('skills', updated, { shouldValidate: true });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter((s) => s !== skillToRemove);
    setValue('skills', updated, { shouldValidate: true });
  };

  // Form Submission
  const onSaveProfile = (data: ProfileFormValues) => {
    setIsSaving(true);

    setTimeout(() => {
      setUserProfile((prev) => ({
        ...prev,
        headline: data.headline,
        bio: data.bio || '',
        aboutMe: data.bio || prev.aboutMe,
        skills: data.skills,
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        avatar: avatarPreview || prev.avatar,
        resumeFileName: resumeName || prev.resumeFileName,
      }));
      setIsSaving(false);
      showToast('Profile Saved!', 'Your Candidate Profile details have been updated successfully.', 'success');
    }, 500);
  };

  const handleReset = () => {
    reset({
      headline: userProfile.headline || userProfile.experienceYears || 'Full Stack Engineer & Solution Architect',
      bio: userProfile.bio || userProfile.aboutMe || '',
      skills: userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      githubUrl: userProfile.githubUrl || '',
      linkedinUrl: userProfile.linkedinUrl || '',
      portfolioUrl: userProfile.portfolioUrl || '',
    });
    setAvatarPreview(userProfile.avatar || '');
    setResumeName(userProfile.resumeFileName || '');
    setAvatarError(null);
    setResumeError(null);
    showToast('Form Reset', 'Reverted form values to original saved state.', 'info');
  };

  const watchedHeadline = watch('headline') || userProfile.headline || 'Full Stack Engineer & Solution Architect';

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs currentTitle="Candidate Profile" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* ================= 1. PROFILE HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={userProfile.fullName || 'Candidate Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-blue-300">
                    <User className="w-12 h-12 mb-1" />
                    <span className="text-[10px] font-bold">No Avatar</span>
                  </div>
                )}
              </div>

              {/* Quick trigger overlay */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer"
              >
                <Upload className="w-6 h-6 mb-1 text-emerald-400" />
                <span>Change Avatar</span>
              </button>
            </div>

            {/* Candidate Header Metadata */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {userProfile.fullName || 'Alex Vance'}
                  </h1>
                  <p className="text-sm font-semibold text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{watchedHeadline}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Trust Score: {userProfile.trustScore || 92}/100</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 font-medium">
                {userProfile.username && <span>@{userProfile.username}</span>}
                {userProfile.email && <span>• {userProfile.email}</span>}
                {userProfile.location && <span>• {userProfile.location}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. EDIT PROFILE FORM ================= */}
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-8">
          
          {/* DRAG-AND-DROP UPLOAD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DRAG & DROP AVATAR UPLOAD (Image only, Max 5MB) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Avatar Upload</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">Max 5MB (Image)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Drag & drop an image or click to select file. Supported formats: PNG, JPG, WebP.
                </p>

                {/* Avatar Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setAvatarDragOver(true);
                  }}
                  onDragLeave={() => setAvatarDragOver(false)}
                  onDrop={handleAvatarDrop}
                  onClick={() => avatarInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    avatarDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400'
                  }`}
                >
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-1 animate-bounce" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {avatarDragOver ? 'Drop image file here' : 'Drag & Drop Avatar Image Here'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    or <span className="text-blue-600 dark:text-blue-400 underline font-semibold">Browse Files</span>
                  </p>
                </div>

                {avatarError && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{avatarError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* DRAG & DROP RESUME UPLOAD (PDF only, Max 10MB) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Resume Upload</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">Max 10MB (PDF Only)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Drag & drop your PDF resume file. Accepted format: PDF document (.pdf).
                </p>

                {/* Resume Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setResumeDragOver(true);
                  }}
                  onDragLeave={() => setResumeDragOver(false)}
                  onDrop={handleResumeDrop}
                  onClick={() => resumeInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    resumeDragOver
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400'
                  }`}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeFileChange}
                    className="hidden"
                  />
                  <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {resumeDragOver ? 'Drop PDF file here' : 'Drag & Drop PDF Resume Here'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    or <span className="text-emerald-600 dark:text-emerald-400 underline font-semibold">Browse Files</span>
                  </p>
                </div>

                {resumeError && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{resumeError}</span>
                  </p>
                )}

                {/* Selected Resume Pill */}
                {resumeName && (
                  <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-emerald-950 dark:text-emerald-200 truncate">
                        {resumeName}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 shrink-0">
                      PDF Attached
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* FORM FIELDS CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <span>Profile Details & Portfolio</span>
            </h3>

            <div className="space-y-6">
              {/* FIELD 1: HEADLINE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Professional Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('headline')}
                  placeholder="e.g. Senior Full Stack Engineer | React & Node.js Specialist"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.headline
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.headline && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.headline.message}</span>
                  </p>
                )}
              </div>

              {/* FIELD 2: BIO */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Bio / About Me
                </label>
                <textarea
                  rows={4}
                  {...register('bio')}
                  placeholder="Tell recruiters and team leads about your experience, achievements, and technical background..."
                  className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.bio
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.bio && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.bio.message}</span>
                  </p>
                )}
              </div>

              {/* FIELD 3: SKILLS (Tag input, max 20 skills) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Technical Skills (Max 20)
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {currentSkills.length} / 20 Skills
                  </span>
                </div>

                {/* Active Skill Tags */}
                {currentSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills added yet. Add your key technical skills below.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950"
                          title={`Remove ${skill}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Skill Controls */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add skill (e.g. Next.js, GraphQL, PyTorch)"
                    disabled={currentSkills.length >= 20}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={currentSkills.length >= 20 || !newSkillInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Tag</span>
                  </button>
                </div>

                {errors.skills && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.skills.message}</span>
                  </p>
                )}
              </div>

              {/* FIELDS 4, 5, 6: LINKS & PORTFOLIO */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Online Profiles & Links
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* GitHub URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub URL</label>
                    <div className="relative">
                      <Github className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="url"
                        {...register('githubUrl')}
                        placeholder="https://github.com/username"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 ${
                          errors.githubUrl
                            ? 'border-rose-500 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.githubUrl && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        {errors.githubUrl.message}
                      </p>
                    )}
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="url"
                        {...register('linkedinUrl')}
                        placeholder="https://linkedin.com/in/username"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 ${
                          errors.linkedinUrl
                            ? 'border-rose-500 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.linkedinUrl && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        {errors.linkedinUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Portfolio URL</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="url"
                        {...register('portfolioUrl')}
                        placeholder="https://myportfolio.dev"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 ${
                          errors.portfolioUrl
                            ? 'border-rose-500 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.portfolioUrl && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        {errors.portfolioUrl.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
