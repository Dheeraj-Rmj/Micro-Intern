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
  Info,
  Edit3,
} from 'lucide-react';

// Zod validation schema with ALL 7 text/list fields marked mandatory
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'This field is required.')
    .max(100, 'Full name must be under 100 characters'),
  headline: z
    .string()
    .min(1, 'This field is required.')
    .max(120, 'Headline must be under 120 characters'),
  bio: z
    .string()
    .min(1, 'This field is required.')
    .max(1000, 'Bio must be under 1000 characters'),
  skills: z
    .array(z.string())
    .min(1, 'This field is required.')
    .max(20, 'You can add up to 20 skills maximum'),
  githubUrl: z
    .string()
    .min(1, 'This field is required.')
    .refine(
      (val) => /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/?$/i.test(val) || /^https?:\/\/[^\s]+$/i.test(val),
      { message: 'Please enter a valid GitHub profile URL (e.g. https://github.com/username)' }
    ),
  linkedinUrl: z
    .string()
    .min(1, 'This field is required.')
    .refine(
      (val) => /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+\/?$/i.test(val) || /^https?:\/\/[^\s]+$/i.test(val),
      { message: 'Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)' }
    ),
  portfolioUrl: z
    .string()
    .min(1, 'This field is required.')
    .refine(
      (val) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(val),
      { message: 'Please enter a valid URL (e.g. https://yourportfolio.com)' }
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const LOCAL_STORAGE_PROFILE_KEY = 'microintern_user_profile';

export const ProfilePage: React.FC = () => {
  const { userProfile, setUserProfile, showToast } = useApp();

  // Profile Save State: false initially, true after first successful save
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isEditedAfterSave, setIsEditedAfterSave] = useState<boolean>(false);

  // File states (initially empty or loaded from persistent state/localStorage)
  const [avatarPreview, setAvatarPreview] = useState<string>(userProfile.avatar || '');
  const [resumeName, setResumeName] = useState<string>(userProfile.resumeFileName || '');

  // Resume Analyzing Loading Animation state
  const [isAnalyzingResume, setIsAnalyzingResume] = useState<boolean>(false);
  const [resumeProgress, setResumeProgress] = useState<number>(0);

  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid, isSubmitted },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      headline: '',
      bio: '',
      skills: [],
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
    },
  });

  // On mount, load saved profile from userProfile or localStorage
  useEffect(() => {
    let savedData: Partial<typeof userProfile> = userProfile;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          savedData = { ...userProfile, ...parsed };
        } catch (e) {
          // ignore error
        }
      }
    }

    if (
      savedData.fullName ||
      savedData.headline ||
      savedData.avatar ||
      savedData.resumeFileName
    ) {
      reset({
        fullName: savedData.fullName || '',
        headline: savedData.headline || '',
        bio: savedData.bio || savedData.aboutMe || '',
        skills: savedData.skills || [],
        githubUrl: savedData.githubUrl || '',
        linkedinUrl: savedData.linkedinUrl || '',
        portfolioUrl: savedData.portfolioUrl || '',
      });

      if (savedData.avatar) setAvatarPreview(savedData.avatar);
      if (savedData.resumeFileName) setResumeName(savedData.resumeFileName);

      // Check if all required fields are saved
      if (
        savedData.fullName &&
        savedData.headline &&
        savedData.bio &&
        savedData.skills &&
        savedData.skills.length > 0 &&
        savedData.githubUrl &&
        savedData.linkedinUrl &&
        savedData.portfolioUrl &&
        savedData.avatar &&
        savedData.resumeFileName
      ) {
        setIsSaved(true);
        setIsEditedAfterSave(false);
      }
    }
  }, [reset]);

  const currentSkills = watch('skills') || [];
  const watchedFullName = watch('fullName') || '';
  const watchedHeadline = watch('headline') || '';
  const watchedBio = watch('bio') || '';
  const watchedGithub = watch('githubUrl') || '';
  const watchedLinkedin = watch('linkedinUrl') || '';
  const watchedPortfolio = watch('portfolioUrl') || '';

  // Track edits after initial successful save
  useEffect(() => {
    if (isSaved) {
      setIsEditedAfterSave(true);
    }
  }, [
    watchedFullName,
    watchedHeadline,
    watchedBio,
    currentSkills,
    watchedGithub,
    watchedLinkedin,
    watchedPortfolio,
    avatarPreview,
    resumeName,
  ]);

  // All 9 fields mandatory check
  const allRequiredFieldsFilled = Boolean(
    watchedFullName.trim() &&
    watchedHeadline.trim() &&
    watchedBio.trim() &&
    currentSkills.length >= 1 &&
    watchedGithub.trim() &&
    watchedLinkedin.trim() &&
    watchedPortfolio.trim() &&
    avatarPreview &&
    resumeName &&
    isValid
  );

  // Button State & Text Determination
  let buttonText = 'Save Profile';
  let isButtonDisabled = false;

  if (!isSaved) {
    buttonText = 'Save Profile';
    isButtonDisabled = !allRequiredFieldsFilled || isSaving;
  } else if (!isEditedAfterSave) {
    buttonText = 'Edit Profile';
    isButtonDisabled = false;
  } else {
    buttonText = 'Save Changes';
    isButtonDisabled = !allRequiredFieldsFilled || isSaving;
  }

  // Handle Avatar validation & upload
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

    // Save avatar immediately to userProfile so header and sidebar update
    const updated = { ...userProfile, avatar: previewUrl };
    setUserProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
    }
    showToast('Avatar Uploaded', `Attached ${file.name}`, 'info');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessAvatar(file);
    }
  };

  // Handle Resume validation, loading animation progress bar & notification
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

    setIsAnalyzingResume(true);
    setResumeProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setResumeProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzingResume(false);
          setResumeName(file.name);

          // Save resume name immediately to userProfile & localStorage
          const updated = { ...userProfile, resumeFileName: file.name };
          setUserProfile(updated);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
          }

          showToast(
            'Resume Uploaded Successfully',
            'Automatic AI profile extraction will be available when the backend API is connected.',
            'info'
          );
        }, 200);
      }
    }, 120);
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessResume(file);
    }
  };

  // Skills Tag Input Handlers
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
    trigger('skills');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter((s) => s !== skillToRemove);
    setValue('skills', updated, { shouldValidate: true });
    trigger('skills');
  };

  // Form Submission
  const onSaveProfile = (data: ProfileFormValues) => {
    if (!avatarPreview) {
      setAvatarError('This field is required.');
    }
    if (!resumeName) {
      setResumeError('This field is required.');
    }

    if (!allRequiredFieldsFilled) {
      trigger();
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updatedProfile = {
        ...userProfile,
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        aboutMe: data.bio,
        skills: data.skills,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        avatar: avatarPreview,
        resumeFileName: resumeName,
      };

      setUserProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      setIsSaving(false);
      setIsSaved(true);
      setIsEditedAfterSave(false);
      showToast('Profile Saved', 'Profile saved successfully.', 'success');
    }, 400);
  };

  const handleReset = () => {
    reset({
      fullName: '',
      headline: '',
      bio: '',
      skills: [],
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
    });
    setAvatarPreview('');
    setResumeName('');
    setAvatarError(null);
    setResumeError(null);
    setIsSaved(false);
    setIsEditedAfterSave(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    }
    showToast('Form Reset', 'Cleared all candidate profile fields.', 'info');
  };

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
                    alt={watchedFullName || 'Candidate Avatar'}
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
                <span>{avatarPreview ? 'Edit Avatar' : 'Upload Avatar'}</span>
              </button>
            </div>

            {/* Candidate Header Metadata */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {watchedFullName || 'Candidate Profile'}
                  </h1>
                  <p className="text-sm font-semibold text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{watchedHeadline || 'Unspecified Headline'}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Trust Score: {userProfile.trustScore || 0}/100</span>
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
          
          {/* UPLOAD CARDS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AVATAR UPLOAD CARD (Single button, hides upload area after upload, shows Edit Avatar) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Avatar Upload <span className="text-rose-500">*</span></span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">Max 5MB (Image)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Upload a professional profile image (PNG, JPG, WebP).
                </p>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                {!avatarPreview ? (
                  /* Initially show ONLY ONE Upload Avatar button */
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Avatar</span>
                    </button>
                    {(!avatarPreview && (avatarError || isSubmitted)) && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>This field is required.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Uploaded state: Hide upload area, display avatar preview & Edit Avatar button */
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarPreview}
                        alt="Uploaded Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Avatar Uploaded</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Image Ready
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Edit Avatar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RESUME UPLOAD CARD (Single button, hides upload area after upload, shows Replace Resume) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Resume Upload <span className="text-rose-500">*</span></span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">Max 10MB (PDF Only)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Upload your PDF resume document (.pdf).
                </p>

                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeFileChange}
                  className="hidden"
                />

                {isAnalyzingResume ? (
                  /* Analyzing Loading State */
                  <div className="border border-emerald-500/40 rounded-2xl p-6 text-center bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Analyzing Resume...
                    </p>
                    <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-150 ease-out"
                        style={{ width: `${resumeProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{resumeProgress}%</span>
                  </div>
                ) : !resumeName ? (
                  /* Initially show ONLY ONE Upload Resume button */
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Resume</span>
                    </button>
                    {(!resumeName && (resumeError || isSubmitted)) && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>This field is required.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Uploaded state: Hide upload area, display filename + Replace Resume button */
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block truncate">
                            {resumeName}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            PDF Attached
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Replace Resume</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2">
                      Resume uploaded successfully. Automatic AI profile extraction will be available when the backend API is connected.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* FORM FIELDS CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <User className="w-5 h-5 text-blue-600" />
                <span>Profile Details & Portfolio</span>
              </h3>

              {/* Header Resume Banner/Button */}
              <div className="inline-flex items-center gap-3 p-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">Upload your resume PDF to complete your profile.</span>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resume</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* FIELD 0: FULL NAME */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="e.g. Alex Vance"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.fullName.message}</span>
                  </p>
                )}
              </div>

              {/* FIELD 1: HEADLINE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Professional Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('headline')}
                  placeholder="e.g. Full Stack Developer"
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
                  Bio / About Me <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register('bio')}
                  placeholder="Tell recruiters about your experience, achievements, and technical background..."
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
                    Technical Skills (Max 20) <span className="text-rose-500">*</span>
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
                    placeholder="Add skill (e.g. React, Node.js, Python)"
                    disabled={currentSkills.length >= 20}
                    className={`flex-1 px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      errors.skills
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
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
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      GitHub URL <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      LinkedIn URL <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Portfolio URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="url"
                        {...register('portfolioUrl')}
                        placeholder="https://yourportfolio.com"
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

          {/* ACTION BUTTONS & SAVE PROFILE STATE */}
          <div className="flex flex-col items-end gap-2 pt-2">
            <div className="flex items-center gap-3">
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
                disabled={isButtonDisabled}
                className={`px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                  isButtonDisabled
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer'
                }`}
              >
                {isSaved && !isEditedAfterSave ? (
                  <Edit3 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : buttonText}</span>
              </button>
            </div>

            {isButtonDisabled && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Please fill all required fields to enable saving.
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
