"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApp } from "../../context/AppContext";
import { AvatarCropper } from "../common/AvatarCropper";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}
import { Breadcrumbs } from "../common/Breadcrumbs";
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
  Award,
  ShieldCheck,
} from "lucide-react";
import { TechSkillIcon } from "../common/TechSkillIcon";

// Zod validation schema with ALL 7 text/list fields marked mandatory
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "This field is required.")
    .max(100, "Full name must be under 100 characters"),
  headline: z
    .string()
    .min(1, "This field is required.")
    .max(120, "Headline must be under 120 characters"),
  bio: z.string().min(1, "This field is required.").max(1000, "Bio must be under 1000 characters"),
  skills: z
    .array(z.string())
    .min(1, "This field is required.")
    .max(20, "You can add up to 20 skills maximum"),
  githubUrl: z
    .string()
    .min(1, "This field is required.")
    .refine((val) => /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i.test(val), {
      message: "Please enter a valid GitHub profile URL (e.g. https://github.com/username)",
    }),
  linkedinUrl: z
    .string()
    .min(1, "This field is required.")
    .refine((val) => /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/i.test(val), {
      message: "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)",
    }),
  portfolioUrl: z
    .string()
    .min(1, "This field is required.")
    .url("Please enter a valid URL (e.g. https://yourportfolio.com)"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const LOCAL_STORAGE_PROFILE_KEY = "microintern_user_profile";

export const ProfilePage: React.FC = () => {
  const { userProfile, setUserProfile, showToast } = useApp();

  // Profile Save State: false initially, true after first successful save
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isEditedAfterSave, setIsEditedAfterSave] = useState<boolean>(false);

  // File states (initially empty or loaded from persistent state/localStorage)
  const [avatarPreview, setAvatarPreview] = useState<string>(userProfile.avatar || "");
  const [resumeName, setResumeName] = useState<string>(userProfile.resumeFileName || "");
  const [bannerPreview, setBannerPreview] = useState<string>(userProfile.bannerUrl || "");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempAvatarSrc, setTempAvatarSrc] = useState("");
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Resume Analyzing Loading Animation state
  const [isAnalyzingResume, setIsAnalyzingResume] = useState<boolean>(false);
  const [resumeProgress, setResumeProgress] = useState<number>(0);

  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Certifications & AI Verification state
  const [certifications, setCertifications] = useState<
    Array<{
      id: string;
      title: string;
      issuer: string;
      url: string;
      aiVerified: boolean;
      score?: number;
      verifying?: boolean;
    }>
  >([]);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");
  const [newCertUrl, setNewCertUrl] = useState("");
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  const handleValidateCertification = (id: string) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, verifying: true } : c)));
    setTimeout(() => {
      setCertifications((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                verifying: false,
                aiVerified: true,
                score: Math.floor(92 + Math.random() * 7),
              }
            : c,
        ),
      );
      showToast(
        "AI Validation Success ✨",
        "Certification cryptographically verified against issuer registry. Trust score boosted by +15 pts!",
        "success",
      );
    }, 1200);
  };

  const handleAddCertification = () => {
    if (!newCertTitle.trim() || !newCertIssuer.trim()) {
      showToast("Missing Fields", "Please enter Certification Title and Issuer.", "warning");
      return;
    }
    const newCert = {
      id: `cert-${Date.now()}`,
      title: newCertTitle.trim(),
      issuer: newCertIssuer.trim(),
      url: newCertUrl.trim() || "https://verify.microintern.ai/credential",
      aiVerified: false,
    };
    setCertifications((prev) => [newCert, ...prev]);
    setNewCertTitle("");
    setNewCertIssuer("");
    setNewCertUrl("");
    setShowAddCertModal(false);
    showToast(
      "Certification Added",
      "Click ✨ Validate with AI to verify this credential.",
      "info",
    );
  };

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
    mode: "onChange",
    defaultValues: {
      fullName: "",
      headline: "",
      bio: "",
      skills: [],
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
  });

  // On mount, load saved profile from userProfile or localStorage
  useEffect(() => {
    let savedData: Partial<typeof userProfile> = userProfile;
    if (typeof window !== "undefined") {
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

    if (savedData.fullName || savedData.headline || savedData.avatar || savedData.resumeFileName) {
      reset({
        fullName: savedData.fullName || "",
        headline: savedData.headline || "",
        bio: savedData.bio || savedData.aboutMe || "",
        skills: savedData.skills || [],
        githubUrl: savedData.githubUrl || "",
        linkedinUrl: savedData.linkedinUrl || "",
        portfolioUrl: savedData.portfolioUrl || "",
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

  const currentSkills = watch("skills") || [];
  const watchedFullName = watch("fullName") || "";
  const watchedHeadline = watch("headline") || "";
  const watchedBio = watch("bio") || "";
  const watchedGithub = watch("githubUrl") || "";
  const watchedLinkedin = watch("linkedinUrl") || "";
  const watchedPortfolio = watch("portfolioUrl") || "";

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
    isValid,
  );

  // Button State & Text Determination
  let buttonText = "Save Profile";
  let isButtonDisabled = false;

  if (!isSaved) {
    buttonText = "Save Profile";
    isButtonDisabled = !allRequiredFieldsFilled || isSaving;
  } else if (!isEditedAfterSave) {
    buttonText = "Edit Profile";
    isButtonDisabled = false;
  } else {
    buttonText = "Save Changes";
    isButtonDisabled = !allRequiredFieldsFilled || isSaving;
  }

  // Handle Banner validation & upload
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Banner Error", "Invalid file format. Please upload an image.", "warning");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Banner Error", "File size exceeds 5MB limit.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBannerPreview(base64String);
      const updated = { ...userProfile, bannerUrl: base64String };
      setUserProfile(updated);
      if (typeof window !== "undefined")
        localStorage.setItem("microintern_user_profile", JSON.stringify(updated));
      showToast("Banner Uploaded", "Cover photo updated.", "info");
    };
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setBannerPreview("");
    const updated = { ...userProfile, bannerUrl: "" };
    setUserProfile(updated);
    if (typeof window !== "undefined")
      localStorage.setItem("microintern_user_profile", JSON.stringify(updated));
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    const updated = { ...userProfile, avatar: "" };
    setUserProfile(updated);
    if (typeof window !== "undefined")
      localStorage.setItem("microintern_user_profile", JSON.stringify(updated));
  };

  // Handle Avatar validation & upload
  const validateAndProcessAvatar = (file: File) => {
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      const err = "Invalid file format. Please upload an image file (JPG, PNG, WebP, GIF).";
      setAvatarError(err);
      showToast("Avatar Error", err, "warning");
      return;
    }
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_AVATAR_SIZE) {
      const err = `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
      setAvatarError(err);
      showToast("Avatar Error", err, "warning");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempAvatarSrc(reader.result as string);
      setCropperOpen(true);
      // Reset input value so same file can be selected again
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setAvatarPreview(croppedBase64);
    const updated = { ...userProfile, avatar: croppedBase64 };
    setUserProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("microintern_user_profile", JSON.stringify(updated));
    }
    showToast("Avatar Updated", "Your profile picture has been saved.", "success");
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
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      const err = "Invalid file format. Only PDF (.pdf) documents are accepted.";
      setResumeError(err);
      showToast("Resume Error", err, "warning");
      return;
    }
    const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_RESUME_SIZE) {
      const err = `Resume size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
      setResumeError(err);
      showToast("Resume Error", err, "warning");
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
        setTimeout(async () => {
          setIsAnalyzingResume(false);
          setResumeName(file.name);

          // Dynamic import of PDF.js from CDN to bypass package manager issues
          const loadPDFJS = async () => {
            const getLib = () => window.pdfjsLib || (window as any)["pdfjs-dist/build/pdf"];
            if (getLib()) return getLib();
            return new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
              script.onload = () => {
                const lib = getLib();
                if (!lib) {
                  reject(new Error("pdfjsLib not found after script load"));
                  return;
                }
                // Ensure it's globally available as pdfjsLib
                window.pdfjsLib = lib;
                lib.GlobalWorkerOptions.workerSrc =
                  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                resolve(lib);
              };
              script.onerror = reject;
              document.body.appendChild(script);
            });
          };

          try {
            const pdfjsLib = await loadPDFJS();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item: any) => item.str).join(" ") + " ";
            }

            // --- Resume Validation ---
            if (fullText.length < 50) {
              setResumeError("Could not read text from PDF.");
              showToast(
                "Invalid Document",
                "Could not read any text from the PDF. Make sure it is not just an image.",
                "warning",
              );
              return;
            }

            const resumeKeywords = [
              "education",
              "experience",
              "skills",
              "projects",
              "university",
              "college",
              "degree",
              "work",
              "employment",
              "profile",
              "summary",
            ];
            const lowerText = fullText.toLowerCase();
            const keywordCount = resumeKeywords.filter((kw) => lowerText.includes(kw)).length;

            if (keywordCount < 2) {
              setResumeError("Upload a real resume");
              showToast(
                "Nice Try",
                "bro do you think im dumb like that 💀 Upload a real resume!",
                "warning",
              );
              return;
            }

            // --- Smart Regex Extraction ---

            // Extract Email
            const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const email = emailMatch ? emailMatch[0] : "";

            // Extract Links
            const urls = fullText.match(/https?:\/\/[^\s]+/g) || [];
            let linkedin = "",
              github = "",
              portfolio = "";
            urls.forEach((url) => {
              if (url.includes("linkedin.com")) linkedin = url;
              else if (url.includes("github.com")) github = url;
              else if (!portfolio) portfolio = url; // first other url as portfolio
            });

            // Extract Skills (Basic Keyword Matching)
            const techKeywords = [
              "JavaScript",
              "TypeScript",
              "React",
              "Node.js",
              "Next.js",
              "Python",
              "Java",
              "C++",
              "SQL",
              "NoSQL",
              "MongoDB",
              "PostgreSQL",
              "AWS",
              "Docker",
              "Kubernetes",
              "GraphQL",
              "REST",
              "HTML",
              "CSS",
              "Tailwind",
              "Git",
            ];
            const foundSkills = techKeywords.filter((skill) => {
              const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              return new RegExp(`\\b${escapedSkill}\\b`, "i").test(fullText);
            });

            // 1. Extract Name
            const cleanFullText = fullText.replace(/\\s+/g, " ").trim();
            let extractedName = "";
            const nameMatch = cleanFullText.match(/^([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2})/);
            if (nameMatch && nameMatch[1] && nameMatch[1].length < 40) {
              extractedName = nameMatch[1];
            } else {
              const words = cleanFullText.split(" ").filter((w) => /^[A-Za-z]+$/.test(w));
              if (words.length >= 2) {
                extractedName = words[0] + " " + words[1];
              }
            }

            // 2. Extract Bio / Summary
            let extractedBio = "";
            const summaryMatch = cleanFullText.match(
              /(?:Summary|Profile|Objective|About Me)\\s*(.*?)(?:Experience|Education|Skills|Work History|Employment|Projects)/i,
            );

            if (summaryMatch && summaryMatch[1]) {
              extractedBio = summaryMatch[1].trim().substring(0, 500);
            }

            // Clear bio if it accidentally grabbed contact info or is too short
            if (
              extractedBio.includes("@") ||
              /\\+?[0-9]{10}/.test(extractedBio) ||
              extractedBio.length < 20
            ) {
              extractedBio = "";
            }

            // 3. Extract Headline
            let extractedHeadline = "";
            const commonTitles = [
              "Software Developer",
              "Software Engineer",
              "Frontend Developer",
              "Backend Developer",
              "Full Stack Developer",
              "Data Scientist",
              "Product Manager",
              "Designer",
              "Engineer",
              "Developer",
              "Analyst",
            ];
            const introText = cleanFullText.substring(0, 500);
            for (const title of commonTitles) {
              if (new RegExp(`\\\\b${title}\\\\b`, "i").test(introText)) {
                extractedHeadline = title;
                break;
              }
            }

            // Clean URLs
            let cleanLinkedin = linkedin.replace(/[^a-zA-Z0-9-.:/?=]/g, "");
            let cleanGithub = github.replace(/[^a-zA-Z0-9-.:/?=]/g, "");
            let cleanPortfolio = portfolio.replace(/[^a-zA-Z0-9-.:/?=]/g, "");

            // Set form values
            setValue("fullName", extractedName, { shouldValidate: true, shouldDirty: true });
            setValue("headline", extractedHeadline, { shouldValidate: true, shouldDirty: true });
            setValue("bio", extractedBio, { shouldValidate: true, shouldDirty: true });

            if (foundSkills.length > 0) {
              setValue("skills", foundSkills.slice(0, 7), {
                shouldValidate: true,
                shouldDirty: true,
              });
            } else {
              setValue("skills", ["JavaScript", "React"], {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            // Fallback for URLs
            const fallbackStr = extractedName.replace(/\s/g, "").toLowerCase() || "candidate";

            // Validate Link Helper
            const validateLink = async (
              url: string,
              type: "github" | "linkedin" | "portfolio",
              expectedName: string,
            ) => {
              if (!url) return "";
              try {
                const res = await fetch("/api/validate-link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url, type, expectedName }),
                });
                if (!res.ok) return url; // Fallback to returning URL if API crashes
                const data = await res.json();
                if (data.isValid) return url;

                // Show a small warning toast if link is fake
                showToast(
                  "Link Validation Failed",
                  `${type} URL was found to be invalid or fake: ${data.reason}`,
                  "warning",
                );
                return "";
              } catch (e) {
                return url; // fallback to URL if network error
              }
            };

            // Run validations concurrently for speed
            const [validGithub, validLinkedin, validPortfolio] = await Promise.all([
              validateLink(
                cleanGithub || `https://github.com/${fallbackStr}`,
                "github",
                extractedName,
              ),
              validateLink(
                cleanLinkedin || `https://linkedin.com/in/${fallbackStr}`,
                "linkedin",
                extractedName,
              ),
              validateLink(
                cleanPortfolio || `https://${fallbackStr}.dev`,
                "portfolio",
                extractedName,
              ),
            ]);

            if (validGithub)
              setValue("githubUrl", validGithub, { shouldValidate: true, shouldDirty: true });
            if (validLinkedin)
              setValue("linkedinUrl", validLinkedin, { shouldValidate: true, shouldDirty: true });
            if (validPortfolio)
              setValue("portfolioUrl", validPortfolio, { shouldValidate: true, shouldDirty: true });

            // Save resume name immediately to userProfile & localStorage
            const updated = { ...userProfile, resumeFileName: file.name };
            setUserProfile(updated);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
            }

            showToast(
              "PDF Extraction Complete 📄",
              "Successfully analyzed your resume and extracted your details!",
              "success",
            );
          } catch (error) {
            console.error("PDF Parsing Error:", error);
            showToast("Extraction Failed", "Could not parse the PDF file.", "warning");
          }
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
      showToast("Duplicate Skill", `"${trimmed}" is already in your skills list.`, "warning");
      return;
    }

    if (currentSkills.length >= 20) {
      showToast("Limit Reached", "You can add up to 20 skills maximum.", "warning");
      return;
    }

    const updated = [...currentSkills, trimmed];
    setValue("skills", updated, { shouldValidate: true });
    setNewSkillInput("");
    trigger("skills");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter((s) => s !== skillToRemove);
    setValue("skills", updated, { shouldValidate: true });
    trigger("skills");
  };

  // Form Submission
  const onSaveProfile = (data: ProfileFormValues) => {
    if (!avatarPreview) {
      setAvatarError("This field is required.");
    }
    if (!resumeName) {
      setResumeError("This field is required.");
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
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      setIsSaving(false);
      setIsSaved(true);
      setIsEditedAfterSave(false);
      showToast("Profile Saved", "Profile saved successfully.", "success");
    }, 400);
  };

  const handleReset = () => {
    reset({
      fullName: "",
      headline: "",
      bio: "",
      skills: [],
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
    });
    setAvatarPreview("");
    setResumeName("");
    setAvatarError(null);
    setResumeError(null);
    setIsSaved(false);
    setIsEditedAfterSave(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    }
    showToast("Form Reset", "Cleared all candidate profile fields.", "info");
  };

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs currentTitle="Candidate Profile" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* ================= 1. PROFILE HEADER ================= */}
        <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-[#0A0A0A] text-black dark:text-white border border-black/5 dark:border-white/10 shadow-sm">
          {/* Banner Area */}
          <div className="relative h-48 sm:h-64 w-full bg-black/5 dark:bg-white/5 overflow-hidden group">
            {bannerPreview ? (
              <Image
                src={bannerPreview}
                alt="Profile Banner"
                className="w-full h-full object-cover"
                fill
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-black/5 dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-transparent border-b border-black/10 dark:border-white/[0.05] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 dark:opacity-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
            )}

            {/* Banner Hover Edit Button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {bannerPreview && (
                <button
                  onClick={removeBanner}
                  className="p-2.5 rounded-full bg-black/50 hover:bg-red-500/80 text-white backdrop-blur-md transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>{bannerPreview ? "Change Cover" : "Add Cover Photo"}</span>
              </button>
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerFileChange}
              className="hidden"
            />
          </div>

          <div className="relative z-10 px-6 sm:px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 sm:-mt-20">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white dark:ring-[#101010] overflow-hidden bg-black/90 dark:bg-white/90 flex items-center justify-center shadow-lg">
                {userProfile.avatar && userProfile.avatar.startsWith("blob:") ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/10 dark:bg-white/10 text-xs text-center p-2">
                    Invalid Session Image. Please Re-upload.
                  </div>
                ) : userProfile.avatar ? (
                  <Image
                    src={userProfile.avatar}
                    alt="Candidate Avatar"
                    className="w-full h-full object-cover"
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#111111] dark:bg-white text-white dark:text-black text-4xl font-black">
                    {(userProfile.fullName || "C").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Quick trigger overlay */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer"
              >
                <Upload className="w-6 h-6 mb-1 text-white" />
                <span>{avatarPreview ? "Edit Avatar" : "Upload Avatar"}</span>
              </button>
            </div>

            {/* Candidate Header Metadata */}
            <div className="flex-1 text-center sm:text-left space-y-2 mt-20 sm:mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                    {watchedFullName || "Candidate Profile"}
                  </h1>
                  <p className="text-sm font-semibold text-black dark:text-white flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-black dark:text-white" />
                    <span>{watchedHeadline || "Unspecified Headline"}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#111111] text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/10 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />
                    <span>Trust Score: {userProfile.trustScore || 0}/100</span>
                  </span>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-black/50 dark:text-white/50 font-medium">
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
            <div className="p-6 rounded-[40px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-black dark:text-white" />
                    <span>
                      Avatar Upload <span className="text-rose-500">*</span>
                    </span>
                  </h3>
                  <span className="text-[11px] font-semibold text-black/50 dark:text-white/50">
                    Max 5MB (Image)
                  </span>
                </div>
                <p className="text-xs text-black/50 dark:text-white/50 mb-4">
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
                      className="px-6 py-3 rounded-[24px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Avatar</span>
                    </button>
                    {!avatarPreview && (avatarError || isSubmitted) && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>This field is required.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Uploaded state: Hide upload area, display avatar preview & Edit Avatar button */
                  <div className="p-4 rounded-[24px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {avatarPreview.startsWith("blob:") ? (
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white text-center leading-tight">
                          Broken
                          <br />
                          Reload
                        </div>
                      ) : (
                        <img
                          src={avatarPreview}
                          alt="Uploaded Avatar"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-black/10 dark:ring-white/10"
                        />
                      )}
                      <div>
                        <span className="text-xs font-bold text-black dark:text-white block">
                          Avatar Uploaded
                        </span>
                        <span className="text-[10px] text-black dark:text-white font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Image Ready
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-black dark:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RESUME UPLOAD CARD (Single button, hides upload area after upload, shows Replace Resume) */}
            <div className="p-6 rounded-[40px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black dark:text-white" />
                    <span>
                      Resume Upload <span className="text-rose-500">*</span>
                    </span>
                  </h3>
                  <span className="text-[11px] font-semibold text-black/50 dark:text-white/50">
                    Max 10MB (PDF Only)
                  </span>
                </div>
                <p className="text-xs text-black/50 dark:text-white/50 mb-4">
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
                  <div className="border border-black/10 dark:border-white/10 rounded-[24px] p-6 text-center bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-xl bg-black/5 dark:bg-white/10 text-black dark:text-white">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-black dark:text-white">
                      Analyzing Resume...
                    </p>
                    <div className="w-full max-w-xs bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#111111] dark:bg-white h-full transition-all duration-150 ease-out"
                        style={{ width: `${resumeProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-black/50 dark:text-white/50">
                      {resumeProgress}%
                    </span>
                  </div>
                ) : !resumeName ? (
                  /* Initially show ONLY ONE Upload Resume button */
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-6 py-3 rounded-[24px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Resume</span>
                    </button>
                    {!resumeName && (resumeError || isSubmitted) && (
                      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>This field is required.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Uploaded state: Hide upload area, display filename + Replace Resume button */
                  <div className="p-4 rounded-[24px] bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-black dark:text-white shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block truncate">
                            {resumeName}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-black dark:text-white">
                            PDF Attached
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/20 hover:bg-black/5 text-xs font-bold text-black dark:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>Replace Resume</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-black/60 dark:text-black/30 dark:text-white/30 font-medium leading-relaxed border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2">
                      Resume uploaded successfully. Automatic AI profile extraction will be
                      available when the backend API is connected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FORM FIELDS CARD */}
          <div className="p-6 sm:p-8 rounded-[40px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 gap-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-black dark:text-white">
                <User className="w-5 h-5 text-black dark:text-white" />
                <span>Profile Details & Portfolio</span>
              </h3>
            </div>

            <div className="space-y-6">
              {/* FIELD 0: FULL NAME */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/50 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="e.g. Alex Vance"
                  className={`w-full px-4 py-3 rounded-xl border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/50 mb-1.5">
                  Professional Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("headline")}
                  placeholder="e.g. Full Stack Developer"
                  className={`w-full px-4 py-3 rounded-xl border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.headline
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/50 mb-1.5">
                  Bio / About Me <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register("bio")}
                  placeholder="Tell recruiters about your experience, achievements, and technical background..."
                  className={`w-full p-4 rounded-xl border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.bio
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
              <div className="pt-2 border-t border-black/5 dark:border-white/5 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/50">
                    Technical Skills (Max 20) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-black dark:text-white dark:text-blue-400">
                    {currentSkills.length} / 20 Skills
                  </span>
                </div>

                {/* Active Skill Tags */}
                {currentSkills.length === 0 ? (
                  <p className="text-xs text-black/40 dark:text-white/40 italic">
                    No skills added yet. Add your key technical skills below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 text-xs font-semibold shadow-xs"
                      >
                        <TechSkillIcon skill={skill} size={15} />
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
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    disabled={currentSkills.length >= 20}
                    placeholder={
                      currentSkills.length >= 20
                        ? "20 skills maximum reached"
                        : "Type skill (e.g. Next.js, OpenAI, Python) & press Enter"
                    }
                    className={`flex-1 px-4 py-2.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 ${
                      errors.skills
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    disabled={currentSkills.length >= 20 || !newSkillInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
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

              {/* NEW SECTION: CERTIFICATIONS & AI CREDENTIAL VALIDATOR */}
              <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/50 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Verified Certifications & AI Validator
                    </label>
                    <p className="text-[11px] text-black/50 dark:text-white/60 mt-0.5">
                      Add certifications and validate them with AI to boost your verified trust
                      score.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(true)}
                    className="px-3 py-1.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Certification
                  </button>
                </div>

                <div className="space-y-2.5">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 mt-0.5">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                            <span>{cert.title}</span>
                            {cert.aiVerified && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                AI Verified ✓
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                            Issuer: <span className="font-medium">{cert.issuer}</span>
                            {cert.score && (
                              <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                                • Confidence Score: {cert.score}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {cert.aiVerified ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleValidateCertification(cert.id)}
                            disabled={cert.verifying}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            {cert.verifying ? "AI Validating..." : "✨ Validate with AI"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline modal / form to add new certification */}
                {showAddCertModal && (
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white">
                        Add New Certification
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCertModal(false)}
                        className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-black/50 dark:text-white/50 mb-1">
                          Certification Title *
                        </label>
                        <input
                          type="text"
                          value={newCertTitle}
                          onChange={(e) => setNewCertTitle(e.target.value)}
                          placeholder="e.g. Google Cloud Professional Architect"
                          className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-[#0A0A0A] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-black/50 dark:text-white/50 mb-1">
                          Issuer / Organization *
                        </label>
                        <input
                          type="text"
                          value={newCertIssuer}
                          onChange={(e) => setNewCertIssuer(e.target.value)}
                          placeholder="e.g. Google Cloud / Coursera / AWS"
                          className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-[#0A0A0A] text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-black/50 dark:text-white/50 mb-1">
                        Credential / Verification URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={newCertUrl}
                        onChange={(e) => setNewCertUrl(e.target.value)}
                        placeholder="https://www.verify.org/credential/12345"
                        className="w-full px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-[#0A0A0A] text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCertModal(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-black/60 dark:text-white/60 hover:bg-black/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="px-4 py-1.5 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs"
                      >
                        Add & Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIELDS 4, 5, 6: LINKS & PORTFOLIO */}
              <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/70">
                  Online Profiles & Links
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-black/50 dark:text-white/60 mb-1">
                      GitHub URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 absolute left-3.5 top-3 text-black/40 dark:text-white/40" />
                      <input
                        type="url"
                        {...register("githubUrl")}
                        placeholder="https://github.com/username"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 ${
                          errors.githubUrl
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
                    <label className="block text-[11px] font-semibold text-black/50 dark:text-white/60 mb-1">
                      LinkedIn URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 absolute left-3.5 top-3 text-black/40 dark:text-white/40" />
                      <input
                        type="url"
                        {...register("linkedinUrl")}
                        placeholder="https://linkedin.com/in/username"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 ${
                          errors.linkedinUrl
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
                    <label className="block text-[11px] font-semibold text-black/50 dark:text-white/60 mb-1">
                      Portfolio URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3.5 top-3 text-black/40 dark:text-white/40" />
                      <input
                        type="url"
                        {...register("portfolioUrl")}
                        placeholder="https://yourportfolio.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 ${
                          errors.portfolioUrl
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-black/5 dark:border-white/20 focus:ring-black/20 dark:focus:ring-white/20"
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
                className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 text-black dark:text-white"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                  isButtonDisabled
                    ? "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 cursor-not-allowed border border-black/10 dark:border-white/10 shadow-none"
                    : "bg-black dark:bg-white hover:opacity-90 text-white dark:text-black shadow-sm cursor-pointer"
                }`}
              >
                {isSaved && !isEditedAfterSave ? (
                  <Edit3 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? "Saving..." : buttonText}</span>
              </button>
            </div>

            {isButtonDisabled && (
              <p className="text-xs font-medium text-black/50 dark:text-white/50">
                Please fill all required fields to enable saving.
              </p>
            )}
          </div>
        </form>
      </div>
      <AvatarCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={tempAvatarSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
