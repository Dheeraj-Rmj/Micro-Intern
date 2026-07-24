'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useState } from 'react';

/**
 * Application Providers — wraps the entire app.
 *
 * Provider order matters:
 * 1. ThemeProvider — must be outermost to prevent FOUC
 * 2. QueryClientProvider — TanStack Query must wrap all data-fetching hooks
 * 3. Toaster — global toast notifications
 *
 * The QueryClient is created inside a useState to ensure each request gets
 * a fresh client (server-side) while browsers reuse the same client.
 * This prevents data leaking between requests in server environments.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global query defaults
            staleTime: 60 * 1000,          // Data fresh for 1 minute
            gcTime: 10 * 60 * 1000,        // Garbage collect after 10 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors are not transient)
              if (
                error instanceof Error &&
                'status' in error &&
                typeof error.status === 'number' &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < 2; // Retry up to 2 times for 5xx/network errors
            },
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: false, // Never retry mutations automatically
            onError: (error) => {
              // Global mutation error handling (logging)
              console.error('[Mutation Error]', error);
            },
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          expand
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'bg-[--color-card] border border-[--color-border] shadow-[--shadow-lg]',
              title: 'text-[--color-foreground-default] font-semibold text-sm',
              description: 'text-[--color-muted-foreground] text-sm',
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
