'use client';

import { useState, useId, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail, Lock, User, Eye, EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/auth.service';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { UnifiedAuthLayout } from './UnifiedAuthLayout';
import {
  AuthDivider,
  AuthInputField,
  AuthSubmitBtn,
  AuthErrorBanner
} from './SharedAuthComponents';

/* ═══════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════ */
function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const login        = useAuthStore(s => s.login);
  const uid          = useId();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [ferr,     setFerr]     = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof ferr = {};
    if (!email.match(/^\S+@\S+\.\S+$/)) e.email    = 'Enter a valid email';
    if (password.length < 8)            e.password = 'Min 8 characters';
    setFerr(e); return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setError(null);
    try {
      const res = await AuthService.login({ email, password });
      // Backend response: { success, token, user }
      // (also includes data: { user, accessToken } for legacy compatibility)
      const user  = res.user  || res.data?.user;
      const token = res.token || res.data?.accessToken;
      if (!token || !user) throw new Error('Invalid server response — missing token or user.');
      login(token, user);

      if (!user.isApproved && (user.role === 'CLIENT' || user.role === 'ADMIN')) {
        setError('Your account is awaiting administrator approval.');
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl');
      let finalUrl = callbackUrl && !callbackUrl.includes('/auth/login') ? callbackUrl : '/dashboard';

      if (!callbackUrl || callbackUrl === '/dashboard') {
        if (user.role === 'CLIENT') {
          finalUrl = '/client/dashboard';
        } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
          finalUrl = '/admin/dashboard';
        }
      }

      window.location.href = finalUrl;
    } catch (e: any) {
      if (!e.response) {
        setError(e.message || 'Server unreachable. Please ensure the backend is running.');
      } else {
        setError(e.response?.data?.message ?? 'Invalid email or password.');
      }
      setLoading(false);
    }
  };


  return (
    <UnifiedAuthLayout mode="login">
      {/* Heading — CSS centers it on mobile, hidden on desktop */}
      <div className="auth-heading-desktop">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Sign in to your vault</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GoogleAuthButton label="Continue with Google" callbackUrl={callbackUrl} />
        <AuthDivider />
        <AuthErrorBanner error={error} />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <AuthInputField id={`${uid}-e`} type="email" label="Email" placeholder="you@example.com"
            value={email} onChange={v => { setEmail(v); setFerr(p => ({ ...p, email: undefined })); }}
            icon={Mail} required autoComplete="email" error={ferr.email} />

          <div>
            <AuthInputField id={`${uid}-p`} type={showPw ? 'text' : 'password'} label="Password"
              placeholder="••••••••" value={password}
              onChange={v => { setPassword(v); setFerr(p => ({ ...p, password: undefined })); }}
              icon={Lock} required autoComplete="current-password" error={ferr.password}
              rightEl={
                <button type="button" tabIndex={-1} onClick={() => setShowPw(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              } />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <Link href="/auth/forgot" style={{ fontSize: 11, fontWeight: 600, color: '#00FF88', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <AuthSubmitBtn loading={loading} label="Sign In" />
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>
    </UnifiedAuthLayout>
  );
}

export function AuthLoginForm() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070E' }} />}>
      <LoginInner />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIGNUP
   ═══════════════════════════════════════════════════════════════ */
export function AuthSignupForm() {
  const uid     = useId();
  const router  = useRouter();
  const login   = useAuthStore(s => s.login);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [ferr,     setFerr]     = useState<Record<string, string>>({});

  const strength = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#00FF88'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2)          e.name     = 'At least 2 characters';
    if (!email.match(/^\S+@\S+\.\S+$/)) e.email    = 'Valid email required';
    if (password.length < 8)             e.password = 'Min 8 characters';
    setFerr(e); return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setError(null);
    try {
      const res = await AuthService.signup({ name, email, password });
      // Backend response: { success, token, user }
      const token = res.token;
      const user = res.user;
      login(token, user);
      if (user.role === 'CLIENT') {
        window.location.href = '/portal';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      if (!e.response) {
        setError('Server unreachable. Please ensure the backend is running.');
      } else {
        setError(e.response?.data?.message ?? 'Something went wrong during account creation. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <UnifiedAuthLayout mode="signup">
      <div className="auth-heading-desktop" style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>Create your vault</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Start your asset management journey</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GoogleAuthButton label="Sign up with Google" callbackUrl="/dashboard" />
        <AuthDivider />
        <AuthErrorBanner error={error} />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <AuthInputField id={`${uid}-n`} type="text" label="Full Name" placeholder="John Smith"
            value={name} onChange={v => { setName(v); setFerr(p => ({ ...p, name: '' })); }}
            icon={User} required autoComplete="name" error={ferr.name} />
          <AuthInputField id={`${uid}-e`} type="email" label="Email" placeholder="you@example.com"
            value={email} onChange={v => { setEmail(v); setFerr(p => ({ ...p, email: '' })); }}
            icon={Mail} required autoComplete="email" error={ferr.email} />

          <div>
            <AuthInputField id={`${uid}-p`} type={showPw ? 'text' : 'password'} label="Password"
              placeholder="Min. 8 characters" value={password}
              onChange={v => { setPassword(v); setFerr(p => ({ ...p, password: '' })); }}
              icon={Lock} required autoComplete="new-password" error={ferr.password}
              rightEl={
                <button type="button" tabIndex={-1} onClick={() => setShowPw(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              } />
            <AnimatePresence>
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'background 0.25s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: strengthColor, fontWeight: 500, marginTop: 4 }}>{strengthLabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AuthSubmitBtn loading={loading} label="Create Account" />
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 10, color: '#374151', margin: 0 }}>
          By signing up, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </UnifiedAuthLayout>
  );
}
