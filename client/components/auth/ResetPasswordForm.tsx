'use client';

import { useState } from 'react';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AuthInputField, AuthSubmitBtn, AuthErrorBanner } from './SharedAuthComponents';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
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
      await api.post('/api/auth/reset-password', { token, password });
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
        <Link href="/auth/login" style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px', background: '#00FF88', color: '#05050A',
          borderRadius: '12px', fontWeight: 700, textDecoration: 'none'
        }}>
          Proceed to Login
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!token && (
        <AuthErrorBanner error="⚠️ Missing reset token in URL. Please use the link sent to your email." />
      )}
      
      <AuthErrorBanner error={status === 'error' ? message : null} />

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <AuthInputField
          id="new-password"
          type="password"
          label="New Password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={setPassword}
          icon={Lock}
          required
          autoComplete="new-password"
        />

        <AuthInputField
          id="confirm-password"
          type="password"
          label="Confirm New Password"
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon={Lock}
          required
          autoComplete="new-password"
        />

        <AuthSubmitBtn loading={status === 'loading'} label="Reset Password" />
      </form>
    </div>
  );
}
