"use client"

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';

const GoogleCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleAuthCallback, isLoading } = useGoogleCalendar();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) {
      setError('No search parameters available');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setError('Authentication was cancelled or failed');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (code) {
      handleAuthCallback(code)
        .then(() => {
          router.push('/');
        })
        .catch((err) => {
          setError(err.message || 'Authentication failed');
          setTimeout(() => router.push('/'), 3000);
        });
    } else {
      setError('No authorization code received');
      setTimeout(() => router.push('/'), 3000);
    }
  }, [searchParams, handleAuthCallback, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] flex items-center justify-center">
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden max-w-md w-full mx-4">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mx-auto mb-4"></div>
              <h2 className="text-yellow-300 text-xl font-bold mb-2">Connecting to Google Calendar</h2>
              <p className="text-white/75">Please wait while we authenticate your account...</p>
            </>
          ) : error ? (
            <>
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h2 className="text-red-400 text-xl font-bold mb-2">Authentication Failed</h2>
              <p className="text-white/75 mb-4">{error}</p>
              <p className="text-white/50 text-sm">Redirecting back to dashboard...</p>
            </>
          ) : (
            <>
              <div className="text-green-400 text-4xl mb-4">✅</div>
              <h2 className="text-green-400 text-xl font-bold mb-2">Successfully Connected!</h2>
              <p className="text-white/75">Your Google Calendar has been connected successfully.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage; 