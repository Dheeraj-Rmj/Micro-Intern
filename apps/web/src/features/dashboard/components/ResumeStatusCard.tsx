"use client";

import Link from "next/link";
import { FileText, UploadCloud, CheckCircle2, Cpu, RefreshCw } from "lucide-react";

export function ResumeStatusCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Resume Status</h3>
              <p className="text-xs text-slate-400">AI Parser &amp; Competency Engine</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Parsed &amp; Active</span>
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <span className="text-xs font-extrabold">PDF</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">ada_lovelace_resume_2026.pdf</p>
                <p className="text-xs text-slate-400">Uploaded July 24, 2026 &bull; 1.2 MB</p>
              </div>
            </div>
            <Link
              href="/resume"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              title="Update Resume"
            >
              <RefreshCw className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-3">
            {[
              "React 19",
              "Next.js App Router",
              "TypeScript Strict",
              "Clean Architecture",
              "PostgreSQL",
              "TanStack Query",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Cpu className="h-4 w-4 text-indigo-400" />
          <span>AI Match Confidence: 94.8%</span>
        </div>
        <Link
          href="/resume"
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload Newer Version</span>
        </Link>
      </div>
    </div>
  );
}
