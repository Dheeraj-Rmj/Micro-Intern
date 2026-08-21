'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { setAccessToken } from '@/lib/api/client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Authentication failed. No token received from provider.');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      try {
        // 1. Set the token in the API client memory store
        setAccessToken(token as string);
        
        // 2. Fetch the user profile from the backend
        const user = await authService.getCurrentUser();
        
        // 3. Save to global state
        useAuthStore.getState().setAuth(user, token as string);
        
        // 4. Set legacy mock UI route state to 'dashboard' and redirect to root
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('microintern_current_route', 'dashboard');
        }
        router.push('/');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to fetch user profile. Please try logging in again.');
        setTimeout(() => router.push('/login'), 3000);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <p className="text-sm text-gray-400">Redirecting you back to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <div className="w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center relative z-10">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Authenticating...
        </h2>
        <p className="text-gray-500 mt-2">
          Securely logging you in. Please wait a moment.
        </p>
      </motion.div>
    </div>
  );
}
