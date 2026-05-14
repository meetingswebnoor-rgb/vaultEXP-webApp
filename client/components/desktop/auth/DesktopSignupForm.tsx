'use client';

import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AuthButton } from '@/components/auth/AuthButton';

export function DesktopSignupForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Signup
      await api.post('/api/auth/signup', { name, email, password });
      
      // 2. Auto-login after signup to get tokens
      const loginRes = await api.post('/api/auth/login', { email, password });
      const { user, accessToken } = loginRes.data.data;
      
      setAuth(user, accessToken);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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

      {/* Name */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          Full Name
        </label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Johnathan Smith"
            className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-xl py-3 pl-11 pr-4 text-white
                       placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/5 transition-all"
          />
        </div>
      </div>

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
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
          Password
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

      <AuthButton isLoading={isLoading} icon={<ArrowRight size={18} />}>
        Get Started
      </AuthButton>

      <div className="pt-4 text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-bold hover:text-vault-green transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
