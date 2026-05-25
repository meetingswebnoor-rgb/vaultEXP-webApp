'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%', 
        borderRadius: '24px', 
        padding: '40px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        flex: 1,
        overflow: 'hidden',
      }}>
      {/* Subtle top border highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.3)] to-transparent" />
      <div className="relative z-10">{children}</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 24 }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: '#00FF88', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', width: 'fit-content', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}>
        <Sparkles size={14} color="#00FF88" /> AI-Powered Intelligence
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ fontSize: 42, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
        Manage your<br />
        <span style={{ background: 'linear-gradient(to right, #fff, #00FF88)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Digital Empire</span><br />
        with precision.
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ fontSize: 15, color: '#9CA3AF', lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
        Connect your businesses, properties, investments, and financial vaults in one unified workspace — built for the modern asset owner.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', width: 'fit-content', transition: 'all 0.3s ease' }} className="hover:bg-white/5 hover:border-white/10">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,255,136,0.05)' }}>
              <Icon size={16} color="#00FF88" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
            </div>
          </div>
        ))}
      </motion.div>
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
      backgroundColor: '#05050A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <AnimatedBackground />

      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 1000,
          display: 'flex', alignItems: 'center',
          gap: 60,
          flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        {/* LEFT — info col (hidden on small screens via globals.css) */}
        <div className="hidden lg:block auth-info-col" style={{ flex: 1, minWidth: 400 }}>
          <AuthInfoCol />
        </div>

        {/* RIGHT — form container */}
        <div className="auth-right-col" style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'stretch', flex: 1, minWidth: 320 }}>
          <AuthCard className="auth-form-wrap">
            {children}
          </AuthCard>
        </div>
      </motion.div>
    </div>
  );
}
