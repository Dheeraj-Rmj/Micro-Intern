import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MicroIntern — Skill Trial Platform',
    template: '%s | MicroIntern',
  },
  description:
    'Evaluate candidates using real-world skill trials instead of resumes. Connect great companies with talented candidates through meaningful work.',
  keywords: ['hiring', 'skill trials', 'recruitment', 'developer jobs', 'technical assessment'],
  authors: [{ name: 'MicroIntern' }],
  creator: 'MicroIntern',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://microintern.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://microintern.io',
    siteName: 'MicroIntern',
    title: 'MicroIntern — Skill Trial Platform',
    description: 'Evaluate candidates using real-world skill trials instead of resumes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MicroIntern — Skill Trial Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroIntern — Skill Trial Platform',
    description: 'Evaluate candidates using real-world skill trials instead of resumes.',
    images: ['/og-image.png'],
    creator: '@microintern',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
