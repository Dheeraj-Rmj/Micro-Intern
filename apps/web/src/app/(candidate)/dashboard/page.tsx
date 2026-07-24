import type { Metadata } from 'next';
import { SkeletonCard } from '@/components/ui/Skeleton';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * Candidate dashboard home page.
 * Server Component — data fetched server-side.
 */
export default function CandidateDashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--color-foreground-default]">
          Your Dashboard
        </h1>
        <p className="text-[--color-muted-foreground] text-sm mt-1">
          Track your trials, applications, and progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['Trials Completed', 'Applications', 'Interviews', 'Offers'].map((stat) => (
          <div
            key={stat}
            className="rounded-2xl border border-[--color-border] bg-[--color-card] p-5"
          >
            <p className="text-xs text-[--color-muted-foreground] font-medium">{stat}</p>
            <p className="mt-2 text-3xl font-bold text-gradient-brand">0</p>
          </div>
        ))}
      </div>

      {/* Recent activity — skeleton placeholders */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Trials</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
