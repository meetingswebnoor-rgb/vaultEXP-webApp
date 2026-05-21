'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';
  const login = useAuthStore((s) => s.login);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await AuthService.login(data);
      return res;
    },
    onSuccess: (data) => {
      const user = data.data.user;
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        setErrorMsg('Unauthorized: Administrator clearance required.');
        return;
      }
      if (user.role === 'ADMIN' && !user.isApproved) {
        setErrorMsg('Your account is awaiting administrator approval.');
        return;
      }
      login(data.data.accessToken, user);
      
      // Prevent infinite redirect loops if callbackUrl points to login
      const finalUrl = callbackUrl.includes('/admin/login') ? '/admin/dashboard' : callbackUrl;
      
      // Use window.location.href to bypass Next.js App Router cache
      // This ensures the dashboard layout and AuthGuard mount freshly with the updated token.
      window.location.href = finalUrl;
    },
    onError: (error: any) => {
      if (!error.response) {
        setErrorMsg('Server unreachable. Please ensure the backend is running.');
      } else {
        setErrorMsg(error.response?.data?.message || 'Authentication failed');
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-vault-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-green/20 to-vault-green/5 border border-vault-green/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.15)]">
            <Shield className="text-vault-green w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-display font-bold text-white tracking-tight">
          VaultEXP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400 uppercase tracking-widest font-semibold">
          Enterprise Admin Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/[0.02] backdrop-blur-xl py-8 px-4 sm:px-10 shadow-2xl border border-white/[0.05] sm:rounded-3xl">
          <form className="space-y-6" onSubmit={handleSubmit((d) => loginMutation.mutate(d))}>
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                <Shield className="text-red-500 w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Administrator Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-black/40 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-vault-green/50 focus:border-vault-green transition-all"
                  placeholder="admin@vaultexp.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Master Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-3 border border-white/10 bg-black/40 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-vault-green/50 focus:border-vault-green transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.15)] text-sm font-bold text-black bg-vault-green hover:bg-[#00cc6a] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#05050A] focus:ring-vault-green disabled:opacity-50 transition-all duration-200"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Secure Login'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
             <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
               ← Return to Public Portal
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05050A] flex items-center justify-center text-vault-green font-display font-bold">Initializing Secure Node...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
