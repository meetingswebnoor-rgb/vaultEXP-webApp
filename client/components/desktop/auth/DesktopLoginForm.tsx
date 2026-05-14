'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AuthButton } from '@/components/auth/AuthButton';

export function DesktopLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      
      setAuth(user, accessToken);
      router.replace(callbackUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          Email Address
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

      {/* Password */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Password
          </label>
          <Link href="/auth/forgot" className="text-xs font-bold text-vault-green hover:text-emerald-400 transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-xl py-3 pl-11 pr-4 text-white
                       placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/5 transition-all"
          />
        </div>
      </div>

      <AuthButton isLoading={isLoading} icon={<ArrowRight size={18} />}>
        Sign In
      </AuthButton>

      <div className="pt-4 text-center">
        <p className="text-gray-500 text-sm">
          New to the platform?{' '}
          <Link href="/auth/signup" className="text-white font-bold hover:text-vault-green transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
