'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Building2, TrendingUp, Shield, Sparkles } from 'lucide-react';

/* ── Shared tiny components ─────────────────────────────────── */

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
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

const STATS = [
  { icon: Building2, label: 'Businesses tracked', value: '12k+' },
  { icon: TrendingUp, label: 'Assets managed',     value: '$2.4B' },
  { icon: Shield,     label: 'Uptime SLA',         value: '99.9%' },
];

export function AuthInfoCol() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 16 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: '#00FF88', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.18)', width: 'fit-content' }}>
        <Sparkles size={11} /> AI-Powered Asset Intelligence
      </div>

      <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: 0, lineHeight: 1.18 }}>
        Manage your<br />
        <span style={{ color: '#00FF88' }}>Digital Empire</span><br />
        with Intelligence.
      </h2>

      <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>
        Connect your businesses, properties, investments, and financial vaults in one unified, AI-powered workspace — built for the modern asset owner.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <Icon size={11} color="#00FF88" style={{ margin: '5.5px auto', display: 'block' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{value}</span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  children: ReactNode;
  mode: string;
}

export function UnifiedAuthLayout({ children, mode }: AuthLayoutProps) {
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
        {/* LEFT — info col (hidden on small screens via globals.css) */}
        <div className="auth-info-col">
          <AuthInfoCol />
        </div>

          {/* RIGHT — form container */}
          <div className="auth-right-col" style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'stretch', flex: 1, minWidth: 300 }}>
            <AuthCard className="auth-form-wrap">
              {children}
            </AuthCard>
          </div>
      </motion.div>
    </div>
  );
}
