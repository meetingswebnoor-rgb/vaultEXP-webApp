'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage('If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto w-16 h-16 bg-vault-green/10 border border-vault-green/30 rounded-full flex items-center justify-center">
          <Send className="text-vault-green" size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Check Your Inbox</h2>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-vault-green font-bold hover:underline">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          Recovery Email
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. alex@vault.com"
            className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-xl py-3 pl-11 pr-4 text-white
                       placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/5 transition-all"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={status === 'loading'}
        className="w-full py-3.5 bg-vault-green text-vault-darker font-bold rounded-xl flex items-center justify-center gap-2
                   shadow-[0_4px_20px_rgba(0,255,136,0.2)] disabled:opacity-50 transition-all"
      >
        {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
      </motion.button>

      {status === 'error' && (
        <p className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg">
          {message}
        </p>
      )}

      <div className="text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </form>
  );
}
