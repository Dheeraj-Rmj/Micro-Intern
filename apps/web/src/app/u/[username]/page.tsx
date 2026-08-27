"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { networkApi } from "@/lib/api/network";
import { TechSkillIcon } from "@/components/microint/components/common/TechSkillIcon";
import { SkillBadge } from "@/components/microint/components/common/SkillBadge";
import { MapPin, Briefcase, GraduationCap, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export default function PublicSkillPassportPage() {
  const { username } = useParams() as { username: string };
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    
    networkApi.getPublicProfile(username)
      .then((res) => {
        if (res.success) {
          setProfile(res.data);
        } else {
          setError("Failed to load profile");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Profile not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" /></div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-red-500">{error || "Not found"}</div>;
  }

  const { user, skills, experiences, educations, certificates } = profile;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 w-full" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 bg-gray-200 overflow-hidden shrink-0 shadow-md">
              <img 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300"} 
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">{profile.headline || "Software Engineer"}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{experiences?.length || 0} Roles</span>
                </div>
              </div>
              
              {/* Trust Score */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg w-max">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Trust Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile.completionPercentage}</span>
                    <span className="text-sm font-medium">/ 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Verified Skills
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills?.map((skill: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center gap-3">
                  <TechSkillIcon skill={skill.skill} size={24} />
                  <div>
                    <div className="font-semibold">{skill.skill}</div>
                    <div className="text-xs text-slate-500">{skill.yearsOfExperience} years exp</div>
                  </div>
                </div>
                <SkillBadge skill={skill.skill} status={skill.verified ? "VERIFIED" : "CLAIMED"} level={skill.level} />
              </div>
            ))}
            {(!skills || skills.length === 0) && (
              <p className="text-slate-500 italic">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              Experience
            </h2>
            
            <div className="space-y-6">
              {experiences.map((exp: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{exp.company}</p>
                    <p className="text-sm text-slate-500 my-1">
                      {new Date(exp.startDate).getFullYear()} - {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : "Present"}
                    </p>
                    <p className="text-sm mt-2">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
