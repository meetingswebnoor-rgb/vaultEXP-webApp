'use client';

import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 500 }}>or continue with email</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
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

export function AuthSubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button type="submit" disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: 8, padding: '12px 0', borderRadius: 12, fontWeight: 700,
        fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: '#00FF88', color: '#05050A',
        boxShadow: '0 4px 24px rgba(0,255,136,0.28)',
        opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
        justifyContent: 'center'
      }}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{label}</span><ArrowRight size={15} /></>}
    </motion.button>
  );
}

export function AuthErrorBanner({ error }: { error: string | null }) {
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
