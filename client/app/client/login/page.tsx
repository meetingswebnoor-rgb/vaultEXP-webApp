'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService, extractToken, extractUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumButton } from '@/components/ui/PremiumButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function ClientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/client/dashboard';
  const login = useAuthStore((s) => s.login);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await AuthService.login(data);
      return res;
    },
    onSuccess: (data) => {
      const user  = extractUser(data);
      const token = extractToken(data);
      if (!user || !token) {
        setErrorMsg('Invalid server response. Please try again.');
        return;
      }
      if (user.role !== 'CLIENT') {
        setErrorMsg('Unauthorized: Client portal access required.');
        return;
      }
      if (!user.isApproved) {
        setErrorMsg('Your account is awaiting administrator approval.');
        return;
      }
      login(token, user);
      router.push(callbackUrl);
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
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white font-sans overflow-hidden selection:bg-vault-emerald/30">
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10"
          >
            <Briefcase className="text-vault-emerald w-10 h-10 drop-shadow-[0_0_10px_rgba(0,230,118,0.5)]" />
          </motion.div>
        </div>
        <h2 className="mt-2 text-center text-4xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
          Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-vault-emerald to-vault-cyan">Portal</span>
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400 max-w-sm mx-auto">
          Securely access your intelligence workspace, documents, and projects.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <GlassCard className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit((d) => loginMutation.mutate(d))}>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center backdrop-blur-sm"
              >
                {errorMsg}
              </motion.div>
            )}

            <PremiumInput
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <PremiumInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <PremiumButton
                type="submit"
                className="w-full"
                isLoading={loginMutation.isPending}
                icon={<ArrowRight size={18} />}
              >
                {loginMutation.isPending ? 'Authenticating...' : 'Access Workspace'}
              </PremiumButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function ClientLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-vault-obsidian flex items-center justify-center text-vault-emerald"><div className="animate-pulse-slow">Initializing Secure Environment...</div></div>}>
      <ClientLoginContent />
    </Suspense>
  );
}
