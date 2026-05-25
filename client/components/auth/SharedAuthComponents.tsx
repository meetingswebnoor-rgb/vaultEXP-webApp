'use client';

import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
      <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Or continue with</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
    </div>
  );
}

export function AuthInputField({
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
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', paddingLeft: 4 }}>
        {label}
      </label>
      <div className="relative group">
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: focused ? '#00FF88' : '#6B7280', transition: 'color 0.3s ease', pointerEvents: 'none', zIndex: 10 }}>
          <Icon size={16} strokeWidth={2} className={focused ? "drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]" : ""} />
        </div>
        <div className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none" style={{ background: focused ? 'linear-gradient(90deg, rgba(0,255,136,0.2), transparent)' : 'transparent', opacity: focused ? 1 : 0, filter: 'blur(8px)' }} />
        <input
          id={id} type={type} value={value} required={required}
          placeholder={placeholder} autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full text-[14px] text-white bg-white/[0.03] outline-none rounded-xl transition-all duration-300 relative z-10"
          style={{
            paddingLeft: 44, paddingRight: rightEl ? 44 : 16,
            paddingTop: 14, paddingBottom: 14,
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: error ? '0 0 15px rgba(239,68,68,0.1)' : focused ? '0 0 20px rgba(0,255,136,0.1), inset 0 0 10px rgba(0,255,136,0.05)' : '0 2px 10px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
            {rightEl}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F87171', paddingLeft: 4, marginTop: 2 }}>
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AuthSubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button type="submit" disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="relative w-full overflow-hidden rounded-xl mt-2 group"
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', fontWeight: 700,
        fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        color: '#05050A', justifyContent: 'center',
        background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
        boxShadow: '0 10px 30px -10px rgba(0,255,136,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
        opacity: loading ? 0.7 : 1, transition: 'all 0.3s ease',
      }}>
      
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>{label}</span><ArrowRight size={16} /></>}
      </div>
    </motion.button>
  );
}

export function AuthErrorBanner({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }} style={{ overflow: 'hidden' }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 8, boxShadow: '0 10px 30px -10px rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: 2 }} className="drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
            <p style={{ fontSize: 13, color: '#FEE2E2', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
