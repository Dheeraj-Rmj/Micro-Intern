'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './AuthProvider';
import { AppProvider } from '@/components/microint/context/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error) => {
              if (
                error instanceof Error &&
                'status' in error &&
                typeof error.status === 'number' &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
          },
          mutations: {
            retry: false,
            onError: (error) => {
              console.error('[Mutation Error]', error);
            }
          }
        }
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster
            position="bottom-right"
            richColors
            expand
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast:
                  'bg-[--color-card] border border-[--color-border] shadow-[--shadow-lg]',
                title:
                  'text-[--color-foreground-default] font-semibold text-sm',
                description: 'text-[--color-muted-foreground] text-sm'
              }
            }}
          />
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
