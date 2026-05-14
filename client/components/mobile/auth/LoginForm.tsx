'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* ── Logo & Header ───────────────────────────────────── */}
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-2xl bg-vault-green/15 border border-vault-green/30 
                        flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
          <Zap size={28} className="text-vault-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-gray-500 mt-2 text-sm">Secure access to your assets</p>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <div className="glass-card-mobile p-6 space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-2xl py-3.5 pl-12 pr-4 text-white
                         placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/10 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Password
            </label>
            <Link href="/auth/forgot" className="text-[11px] font-bold text-vault-green hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-2xl py-3.5 pl-12 pr-12 text-white
                         placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-vault-green text-vault-darker font-bold rounded-2xl mt-4
                     shadow-[0_4px_20px_rgba(0,255,136,0.3)] hover:shadow-[0_4px_25px_rgba(0,255,136,0.5)] transition-all"
        >
          Login
        </motion.button>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <p className="text-center text-gray-500 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-vault-green font-bold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
