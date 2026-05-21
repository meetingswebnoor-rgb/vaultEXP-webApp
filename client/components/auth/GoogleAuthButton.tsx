'use client';

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils/cn';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

// ── Inner button (must be child of GoogleOAuthProvider) ──────────
function GoogleButtonInner({
  label = 'Continue with Google',
  className,
  callbackUrl = '/dashboard',
}: {
  label?: string;
  className?: string;
  callbackUrl?: string;
}) {
  const router   = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        // Exchange access_token for user info, then send to our backend
        // We use the access_token to get user info from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();

        // Send to our backend using access_token as idToken placeholder
        // Backend will verify via userinfo endpoint
        const res = await api.post('/auth/google', {
          idToken: tokenResponse.access_token,
          googleUser, // send user info as well for direct use
        });
        const { user, accessToken } = res.data.data;
        loginStore(accessToken, user);
        router.replace(callbackUrl);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Google sign-in failed. Try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <div className="w-full space-y-2">
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => login()}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-3',
          'rounded-xl border py-3 px-4',
          'text-[13px] font-semibold text-white',
          'transition-all duration-200',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          className
        )}
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.10)',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        ) : (
          // Google "G" SVG
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>{loading ? 'Signing in…' : label}</span>
      </motion.button>

      {error && (
        <p className="text-center text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
}

// ── Public export wrapped with provider ──────────────────────────
export function GoogleAuthButton(props: {
  label?: string;
  className?: string;
  callbackUrl?: string;
}) {
  if (!CLIENT_ID || CLIENT_ID.includes('YOUR_GOOGLE')) {
    return (
      <button
        type="button"
        disabled
        title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env to enable Google sign-in"
        className="w-full flex items-center justify-center gap-3 rounded-xl border py-3 px-4
                   text-[13px] font-semibold text-gray-600 cursor-not-allowed
                   border-white/[0.06] bg-white/[0.02]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" opacity="0.4">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google (configure .env)
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleButtonInner {...props} />
    </GoogleOAuthProvider>
  );
}
