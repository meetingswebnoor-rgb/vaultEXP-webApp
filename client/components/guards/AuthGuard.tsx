'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * PremiumLoadingScreen — shown while the auth store is rehydrating from localStorage.
 *
 * Uses inline styles as a guaranteed fallback so the screen renders correctly
 * even before Tailwind CSS or CSS variables have fully mounted.
 */
function PremiumLoadingScreen({ message = 'Initializing Vault...' }: { message?: string }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05050A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'rgba(0, 255, 136, 0.04)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '35vw',
          height: '35vw',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.04)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glass card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          padding: '48px 56px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))',
            border: '1px solid rgba(0,255,136,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0,255,136,0.1)',
          }}
        >
          {/* Vault icon — SVG inline */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#00FF88" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" stroke="#00FF88" strokeWidth="1.5"/>
            <path d="M12 9V7" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 17V15" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 12H7" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17 12H15" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="18" y="10.5" width="2" height="3" rx="1" fill="#00FF88"/>
          </svg>
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            VaultEXP
          </p>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '4px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Enterprise Platform
          </p>
        </div>

        {/* Spinner ring */}
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(0,255,136,0.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#00FF88',
              animation: 'vault-spin 0.9s linear infinite',
              boxShadow: '0 0 12px rgba(0,255,136,0.3)',
            }}
          />
        </div>

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              minWidth: '200px',
            }}
          >
            {message}{dots}
          </p>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              marginTop: '6px',
            }}
          >
            Securing your connection to the financial mesh
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '180px',
            height: '2px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00FF88, #00cc6a)',
              animation: 'vault-progress 2s ease-in-out infinite',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes vault-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vault-progress {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

/**
 * AuthGuard
 * Wraps every authenticated route. Reads from the canonical zustand store.
 * - If not authenticated → redirect to /auth/login with callbackUrl.
 * - While hydrating → show a premium loading screen.
 * - Safety timeout: force-resolves hydration after 2s to prevent infinite stuck state.
 */
export function AuthGuard({ children, fallbackUrl = '/auth/login' }: { children: ReactNode, fallbackUrl?: string }) {
  const { isAuthenticated, isHydrated, token, setHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Primary: sync hydration flag if zustand persist already ran
    if (!isHydrated && useAuthStore.persist?.hasHydrated()) {
      setHydrated();
    }

    // Safety fallback: force-resolve after 2s so the app never stays permanently stuck.
    // This handles edge cases where onRehydrateStorage fails silently
    // (e.g., corrupt secureStorage data, XOR decryption error, first-time user).
    const safetyTimer = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (!currentState.isHydrated) {
        currentState.setHydrated();
      }
    }, 2000);

    return () => clearTimeout(safetyTimer);
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    // Only redirect after the store has been hydrated from localStorage.
    // Ensure we don't redirect to the same page causing a loop.
    if (isHydrated && !isAuthenticated && !token) {
      if (pathname === fallbackUrl || pathname === '/auth/login' || pathname === '/admin/login') {
        return; // Don't loop redirect
      }
      
      const safeCallbackUrl = encodeURIComponent(pathname);
      window.location.href = `${fallbackUrl}?callbackUrl=${safeCallbackUrl}`;
    }
  }, [isHydrated, isAuthenticated, token, pathname, fallbackUrl]);

  // Show premium loading screen while Zustand is rehydrating from localStorage
  if (!isHydrated) {
    return <PremiumLoadingScreen message="Initializing Vault" />;
  }

  // After hydration: if not authenticated, show redirect screen
  if (!isAuthenticated && !token) {
    return <PremiumLoadingScreen message="Redirecting to secure login" />;
  }

  return <>{children}</>;
}
