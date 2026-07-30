'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AssessmentStudio } from '@/components/management/AssessmentStudio';
import { assessmentApi, type AssessmentDto } from '@/lib/api/assessment';

export default function AssessmentStudioPage() {
  const params = useParams();
  const id = params ? (params['id'] as string) : undefined;

  const [assessment, setAssessment] = useState<AssessmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      if (!id || id === 'new') {
        // Default clean new draft assessment for Studio
        setAssessment({
          id: 'draft-' + Math.random().toString(36).substring(2, 9),
          companyId: 'company-1',
          createdById: 'recruiter-1',
          status: 'DRAFT',
          title: 'New Enterprise Work Assessment',
          slug: 'new-enterprise-work-assessment',
          description: 'Evaluate candidates using real-world competency tasks instead of resumes.',
          instructions: '# Assessment Instructions\n\n1. Review the requirements carefully.\n2. Complete all required tasks in order.\n3. Submit your deliverables via the platform.',
          skillsRequired: ['TypeScript', 'Node.js', 'System Design', 'Clean Architecture'],
          roleTitle: 'Senior Software Engineer',
          level: 'SENIOR',
          durationMinutes: 120,
          passingScore: 75,
          maxAttempts: 3,
          isPublic: true,
          complexityScore: 80,
          aiDifficultyScore: 75,
          tasks: [
            {
              id: 'task-1',
              title: 'API Architecture & Rate Limiting Design',
              description: 'Design a distributed rate limiter in Node.js using Redis with token bucket algorithm.',
              taskType: 'CODING',
              isRequired: true,
              maxPoints: 50,
              sortOrder: 1,
              criteria: [
                {
                  title: 'Algorithm Correctness',
                  description: 'Token bucket handles concurrency safely',
                  maxPoints: 25,
                },
                {
                  title: 'Clean Architecture & Testing',
                  description: 'Well-separated domain and infrastructure layers',
                  maxPoints: 25,
                },
              ],
            },
          ],
          deliverables: [
            {
              id: 'deliv-1',
              title: 'GitHub Repository with Rate Limiter Solution',
              deliverableType: 'GITHUB_REPO',
              isRequired: true,
              description: 'Public or shared repo with instructions in README.md',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const data = await assessmentApi.getAssessmentDetails(id);
        setAssessment(data);
      } catch (err: any) {
        console.error('Failed to load assessment:', err);
        setError('Could not load assessment details from server.');
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Enterprise Assessment Studio...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-200">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-lg font-bold text-red-400">Error Loading Assessment</h2>
          <p className="text-sm text-slate-400">{error || 'Assessment not found.'}</p>
        </div>
      </div>
    );
  }

  return <AssessmentStudio initialAssessment={assessment} />;
}
