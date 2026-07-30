import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MicroIntern — Enterprise Assessment Studio',
  description: 'AI-Native Competency-Based Work Assessment Studio for Enterprise Recruiter Evaluation',
};

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 antialiased">
      {children}
    </div>
  );
}
