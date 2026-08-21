import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | MicroIntern',
  description: 'Sign in to your MicroIntern account to access your candidate dashboard.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left side: branding & illustration */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-50 to-white border-r border-gray-100 relative overflow-hidden">
        {/* Background blobs for aesthetic */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="z-10 relative">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
              MicroIntern
            </span>
          </Link>
          <div className="mt-24">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Launch your career <br />
              with real-world experience.
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-md">
              Join thousands of candidates completing micro-internships, building portfolios, and getting hired by top tech companies.
            </p>
          </div>
        </div>
        
        <div className="z-10 relative">
          <blockquote className="text-gray-700 italic border-l-4 border-indigo-500 pl-4 py-1">
            "MicroIntern completely changed how we hire. The candidates are pre-vetted with real project evidence."
          </blockquote>
          <p className="mt-2 text-sm font-semibold text-gray-900">— Sarah J., Engineering Manager at TechCorp</p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-8">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
                MicroIntern
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to your account or create a new one to continue.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <OAuthButtons />

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">or</span>
              </div>
            </div>

            <form className="space-y-4" action="#">
              {/* Fallback traditional email login */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all hover:shadow-md"
                >
                  Continue with Email
                </button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-8">
            By clicking continue, you agree to our{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
