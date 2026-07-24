import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | Dashboard — MicroIntern', default: 'Dashboard — MicroIntern' },
};

/**
 * Candidate portal layout — authenticated area.
 * This layout wraps /dashboard/* routes.
 */
export default function CandidateDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--color-background-default]">
      {/* Sidebar + content layout */}
      <div className="flex">
        {/* Sidebar placeholder — implemented by feature teams */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-[--color-border] min-h-screen bg-[--color-card]">
          <div className="p-6">
            <div className="h-8 w-32 skeleton rounded-md" />
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
