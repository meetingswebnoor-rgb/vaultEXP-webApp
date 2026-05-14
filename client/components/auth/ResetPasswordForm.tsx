'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    
    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Token is invalid or has expired.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto w-16 h-16 bg-vault-green/10 border border-vault-green/30 rounded-full flex items-center justify-center">
          <CheckCircle className="text-vault-green" size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Password Updated</h2>
          <p className="text-gray-500 text-sm">Your password has been reset successfully. You can now log in with your new credentials.</p>
        </div>
        <Link href="/auth/login" className="w-full py-3.5 bg-vault-green text-vault-darker font-bold rounded-xl flex items-center justify-center gap-2">
          Proceed to Login
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {!token && (
        <p className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg mb-4">
          ⚠️ Missing reset token in URL. Please use the link sent to your email.
        </p>
      )}

      {/* New Password */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          New Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
            className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-xl py-3 pl-11 pr-4 text-white
                       placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/5 transition-all"
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          Confirm New Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-type new password"
            className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-xl py-3 pl-11 pr-4 text-white
                       placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/5 transition-all"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={status === 'loading' || !token}
        className="w-full py-3.5 bg-vault-green text-vault-darker font-bold rounded-xl mt-4 flex items-center justify-center gap-2
                   shadow-[0_4px_20px_rgba(0,255,136,0.2)] disabled:opacity-50 transition-all"
      >
        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
      </motion.button>

      {status === 'error' && (
        <p className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg">
          {message}
        </p>
      )}
    </form>
  );
}
