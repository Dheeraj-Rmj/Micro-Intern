import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Topbar, Sidebar } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Candidate Dashboard | MicroIntern',
  description:
    'Manage your micro-internships, skills, resume, and trial applications.'
};

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
        <Topbar />
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
