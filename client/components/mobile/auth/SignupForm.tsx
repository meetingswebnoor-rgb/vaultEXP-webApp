'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap } from 'lucide-react';
import Link from 'next/link';

export function SignupForm() {
  return (
    <div className="space-y-8">
      {/* ── Logo & Header ───────────────────────────────────── */}
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-2xl bg-vault-green/15 border border-vault-green/30 
                        flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
          <Zap size={28} className="text-vault-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Create Your Vault</h1>
        <p className="text-gray-500 mt-2 text-sm">Start your asset management journey</p>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <div className="glass-card-mobile p-6 space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
            Full Name
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-2xl py-3.5 pl-12 pr-4 text-white
                         placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/10 transition-all"
            />
          </div>
        </div>

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
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-vault-green transition-colors" size={18} />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-vault-dark/40 border border-vault-border/60 rounded-2xl py-3.5 pl-12 pr-4 text-white
                         placeholder-gray-700 outline-none focus:border-vault-green/50 focus:ring-4 focus:ring-vault-green/10 transition-all"
            />
          </div>
        </div>

        {/* Signup Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-vault-green text-vault-darker font-bold rounded-2xl mt-4
                     shadow-[0_4px_20px_rgba(0,255,136,0.3)] hover:shadow-[0_4px_25px_rgba(0,255,136,0.5)] transition-all"
        >
          Get Started
        </motion.button>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <p className="text-center text-gray-500 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-vault-green font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
