'use client';

import React, { useEffect, useState } from 'react';

import { CandidateProfileForm } from '@/components/candidate/CandidateProfileForm';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { candidateApi, type CandidateProfileWithRelations } from '@/lib/api/candidate';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfileWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await candidateApi.getProfile();
        setProfile(data);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error !== null) {
    return <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/10 rounded">{error}</div>;
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information, resume, and preferences.
          </p>
        </div>
        
        {/* Completion Percentage Badge */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            Profile Completion
          </span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                style={{ width: `${profile.completionPercentage}%` }}
              />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {profile.completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      <CandidateProfileForm 
        initialProfile={profile} 
        onProfileUpdate={setProfile} 
      />
    </div>
  );
}
