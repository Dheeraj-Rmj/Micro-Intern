'use client';

import Link from 'next/link';
import { Calendar, Video, Clock, ArrowRight, Sparkles } from 'lucide-react';

export function UpcomingInterviewsCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upcoming Interviews
              </h3>
              <p className="text-xs text-slate-400">
                Direct hiring lead conversations
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            1 Scheduled
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Fast-Track Technical Deep Dive</span>
              </div>
              <h4 className="mt-1 text-base font-bold text-white">
                Senior Frontend Engineer Interview
              </h4>
              <p className="text-xs text-slate-300">
                FinTech Cloud Inc. &bull; Sarah Chen (VP of Engineering)
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Tomorrow, July 29, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>2:00 PM - 2:45 PM EST</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/80 pt-3">
            <a
              href="#zoom-invite"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-transform active:scale-[0.99]"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Join Video Evaluation Link</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
        <span className="text-xs text-slate-400">
          Prepare your assessment code demo for discussion
        </span>
        <Link
          href="/applications"
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          <span>All Schedules</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
