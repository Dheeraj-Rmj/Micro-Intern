'use client';

import {
  Briefcase,
  CheckCircle2,
  Code2,
  Calendar,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const stats = [
  {
    name: 'Active Assessments',
    value: '2',
    change: '+1 this week',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  {
    name: 'Profile Completion',
    value: '85%',
    change: 'Ready for Senior fast-track',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400'
  },
  {
    name: 'Verified Skill Tags',
    value: '14',
    change: 'React 19, TS, Clean Arch',
    icon: Code2,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400'
  },
  {
    name: 'Interview Invites',
    value: '1',
    change: 'Series B FinTech Lead',
    icon: Calendar,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400'
  }
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stat.name}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bgColor} ${stat.textColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {stat.value}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <span>{stat.change}</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100 ${stat.color}" />
          </div>
        );
      })}
    </div>
  );
}
