'use client';

import { useState, useId, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, CheckCircle2,
  Shield, TrendingUp, Building2, Sparkles,
} from 'lucide-react';
import useAuth from '@/src/store/useAuth';
import { api } from '@/lib/api';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

/* ─── Shared tiny components ─────────────────────────────────── */

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 500 }}>or continue with email</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

function InputField({
  id, type, label, placeholder, value, onChange,
  icon: Icon, required, rightEl, error, autoComplete,
}: {
  id: string; type: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; required?: boolean;
  rightEl?: React.ReactNode; error?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#00FF88' : '#4B5563', transition: 'color 0.15s', pointerEvents: 'none' }}>
          <Icon size={14} strokeWidth={2} />
        </div>
        <input
          id={id} type={type} value={value} required={required}
          placeholder={placeholder} autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', paddingLeft: 40, paddingRight: rightEl ? 40 : 16,
            paddingTop: 10, paddingBottom: 10, fontSize: 13, color: '#fff',
            background: 'rgba(255,255,255,0.04)', outline: 'none', borderRadius: 12,
            border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : focused ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.09)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(0,255,136,0.07)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#F87171', marginTop: 4 }}>
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Left info column ───────────────────────────────────────── */
const STATS = [
  { icon: Building2, label: 'Businesses tracked', value: '12k+' },
  { icon: TrendingUp, label: 'Assets managed',     value: '$2.4B' },
  { icon: Shield,     label: 'Uptime SLA',         value: '99.9%' },
];

function InfoCol() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 16 }}>
      {/* badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: '#00FF88', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.18)', width: 'fit-content' }}>
        <Sparkles size={11} /> AI-Powered Asset Intelligence
      </div>

      {/* heading */}
      <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: 0, lineHeight: 1.18 }}>
        Manage your<br />
        <span style={{ color: '#00FF88' }}>Digital Empire</span><br />
        with Intelligence.
      </h2>

      {/* sub */}
      <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>
        Connect your businesses, properties, investments, and financial vaults in one unified, AI-powered workspace — built for the modern asset owner.
      </p>

      {/* stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={11} color="#00FF88" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{value}</span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Glass card ─────────────────────────────────────────────── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: '100%', borderRadius: 20, padding: '32px',
        background: 'rgba(255,255,255,0.035)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        flex: 1,
      }}>
      {children}
    </div>
  );
}

/* ─── Page shell ─────────────────────────────────────────────── */
function Shell({ children, mode }: { children: React.ReactNode; mode: string }) {
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#07070E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 880,
          display: 'flex', alignItems: 'stretch',
          gap: 0,
          flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─── Submit button ──────────────────────────────────────────── */
function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button type="submit" disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '12px 0', borderRadius: 12, fontWeight: 700,
        fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: '#00FF88', color: '#05050A',
        boxShadow: '0 4px 24px rgba(0,255,136,0.28)',
        opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
      }}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{label}</span><ArrowRight size={15} /></>}
    </motion.button>
  );
}

/* ─── Error banner ───────────────────────────────────────────── */
function ErrorBanner({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 4 }}>
            <AlertCircle size={14} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#F87171', fontWeight: 500, margin: 0 }}>{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════ */
function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const login = useAuth(s => s.login);
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
      const res = await api.post('/api/auth/login', { email, password });
      // res.data = { success: true, data: { user, accessToken } }
      login(res.data.data);
      router.replace(callbackUrl);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <Shell mode="login">
      {/* LEFT — info col (hidden on small screens) */}
      <div style={{ display: 'none' }} className="auth-info-col">
        <InfoCol />
      </div>

      {/* RIGHT — logo + form */}
      <div className="auth-right-col" style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'stretch', flex: 1, minWidth: 300 }}>
        {/* Logo above card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo.png" alt="VaultEXP" width={140} height={36} style={{ objectFit: 'contain' }} priority />
        </div>

        <Card className="auth-form-wrap">
          {/* Heading — CSS centers it, hidden on desktop when InfoCol is shown */}
          <div className="auth-heading-desktop">
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Sign in to your vault</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GoogleAuthButton label="Continue with Google" callbackUrl={callbackUrl} />
            <Divider />
            <ErrorBanner error={error} />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
              <InputField id={`${uid}-e`} type="email" label="Email" placeholder="you@example.com"
                value={email} onChange={v => { setEmail(v); setFerr(p => ({ ...p, email: undefined })); }}
                icon={Mail} required autoComplete="email" error={ferr.email} />

              <div>
                <InputField id={`${uid}-p`} type={showPw ? 'text' : 'password'} label="Password"
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

              <SubmitBtn loading={loading} label="Sign In" />
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Shell>
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
  const router  = useRouter();
  const uid     = useId();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
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
      await api.post('/api/auth/signup', { name, email, password });
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Something went wrong during account creation.');
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Shell mode="done">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 0', gap: 16 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                style={{ width: 60, height: 60, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.25)', boxShadow: '0 0 28px rgba(0,255,136,0.18)' }}>
                <CheckCircle2 size={30} color="#00FF88" />
              </motion.div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', fontFamily: 'Outfit, Inter, sans-serif' }}>Vault created!</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Your account is ready. Please sign in to continue.</p>
              </div>
              <Link 
                href="/auth/login" 
                style={{ 
                  width: '100%',
                  background: '#00FF88', 
                  color: '#000', 
                  textDecoration: 'none', 
                  padding: '12px', 
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: 14
                }}
              >
                Sign In Now
              </Link>
            </div>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell mode="signup">
      {/* LEFT info col */}
      <div style={{ display: 'none' }} className="auth-info-col">
        <InfoCol />
      </div>

      {/* RIGHT: logo + card */}
      <div className="auth-right-col" style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minWidth: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo.png" alt="VaultEXP" width={140} height={36} style={{ objectFit: 'contain' }} priority />
        </div>

        <Card className="auth-form-wrap">
          <div className="auth-heading-desktop" style={{ marginBottom: 20, textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: '0 0 4px' }}>Create your vault</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Start your asset management journey</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GoogleAuthButton label="Sign up with Google" callbackUrl="/dashboard" />
            <Divider />
            <ErrorBanner error={error} />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
              <InputField id={`${uid}-n`} type="text" label="Full Name" placeholder="John Smith"
                value={name} onChange={v => { setName(v); setFerr(p => ({ ...p, name: '' })); }}
                icon={User} required autoComplete="name" error={ferr.name} />
              <InputField id={`${uid}-e`} type="email" label="Email" placeholder="you@example.com"
                value={email} onChange={v => { setEmail(v); setFerr(p => ({ ...p, email: '' })); }}
                icon={Mail} required autoComplete="email" error={ferr.email} />

              <div>
                <InputField id={`${uid}-p`} type={showPw ? 'text' : 'password'} label="Password"
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

              <SubmitBtn loading={loading} label="Create Account" />
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </p>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#374151', margin: 0 }}>
              By signing up, you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
