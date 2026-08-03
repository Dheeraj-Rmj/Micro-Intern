import { Providers } from '@/providers';
import type { Metadata, Viewport } from 'next';
import './globals.css';

// Using system font fallback to prevent Google Fonts network build/dev timeouts
const inter = {
  variable: '--font-sans',
};

export const metadata: Metadata = {
  title: {
    default: 'MicroIntern — Skill Assessment Platform',
    template: '%s | MicroIntern',
  },
  description:
    'Evaluate candidates using real-world skill assessments instead of resumes. Connect great companies with talented candidates through meaningful work.',
  keywords: ['hiring', 'skill assessments', 'recruitment', 'developer jobs', 'technical assessment'],
  authors: [{ name: 'MicroIntern' }],
  creator: 'MicroIntern',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Instrument+Serif:ital@1&family=Playfair+Display:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
