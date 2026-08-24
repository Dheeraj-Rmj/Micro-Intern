"use client";

import React, { useState } from "react";

import { candidateApi, type CandidateProfileWithRelations } from "@/lib/api/candidate";

import { Button } from "../ui/Button";
import { FileUpload } from "../ui/FileUpload";

interface CandidateProfileFormProps {
  initialProfile: CandidateProfileWithRelations;
  onProfileUpdate: (updatedProfile: CandidateProfileWithRelations) => void;
}

export function CandidateProfileForm({
  initialProfile,
  onProfileUpdate,
}: CandidateProfileFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const updated = await candidateApi.updateProfile({
        profile: {
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          yearsOfExperience: profile.yearsOfExperience,
          isOpenToWork: profile.isOpenToWork,
          isPublic: profile.isPublic,
          updatedAt: profile.updatedAt?.toString(), // optimistic concurrency
        },
        // We'd add other nested relations here in a full form
      });
      setProfile(updated);
      onProfileUpdate(updated);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<void> => {
    await candidateApi.uploadAvatar(file);
    // Profile update doesn't return full profile immediately on avatar change
    // but in a real app we might fetch it again or optimistically update
  };

  const handleResumeUpload = async (file: File) => {
    await candidateApi.uploadResume(file);
    // Show toast or pending status
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* File Uploads Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Media & Resume</h3>
        <FileUpload
          label="Profile Picture (Avatar)"
          accept="image/jpeg, image/png, image/webp"
          onUpload={handleAvatarUpload}
          buttonText="Upload Avatar"
        />
        <FileUpload
          label="Resume (PDF/DOCX)"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onUpload={handleResumeUpload}
          buttonText="Upload Resume"
        />
      </div>

      {/* Basic Info Form */}
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>

        {error !== null && <div className="text-red-500 text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Headline
            </label>
            <input
              type="text"
              value={profile.headline ?? ""}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm p-2 border"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm p-2 border"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Location
              </label>
              <input
                type="text"
                value={profile.location ?? ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm p-2 border"
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Years of Experience
              </label>
              <input
                type="number"
                value={profile.yearsOfExperience ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setProfile({ ...profile, yearsOfExperience: Number.isNaN(val) ? 0 : val });
                }}
                min="0"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.isOpenToWork}
                onChange={(e) => setProfile({ ...profile, isOpenToWork: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Open to Work</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.isPublic}
                onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Make Profile Public
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
