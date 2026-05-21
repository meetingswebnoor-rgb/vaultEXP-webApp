'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AuthInputField, AuthSubmitBtn, AuthErrorBanner } from './SharedAuthComponents';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await api.post('/api/auth/forgot-password', { email });
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
    <div className="space-y-6">
      <AuthErrorBanner error={status === 'error' ? message : null} />
      
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <AuthInputField
          id="recovery-email"
          type="email"
          label="Recovery Email"
          placeholder="e.g. alex@vault.com"
          value={email}
          onChange={setEmail}
          icon={Mail}
          required
          autoComplete="email"
        />

        <AuthSubmitBtn loading={status === 'loading'} label="Send Reset Link" />

        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
