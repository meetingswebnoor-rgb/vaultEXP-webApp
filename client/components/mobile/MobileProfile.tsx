'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  Bell, 
  Palette, 
  Layout, 
  LogOut, 
  Edit2, 
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export function MobileProfile() {
  const { user, clearAuth, updateSettings } = useAuthStore();
  const { showToast } = useToast();

  const handleLogout = () => {
    showToast('Logging out...', 'info');
    setTimeout(() => clearAuth(), 800);
  };

  const toggleTheme = () => {
    const currentTheme = user?.settings?.theme || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    showToast(`Switched to ${nextTheme} mode`, 'info');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── 1. Profile Header ───────────────────────────────────── */}
      <section className="flex flex-col items-center text-center gap-4 py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-vault-green/20 to-blue-500/20 p-1 border border-white/10 relative z-10">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-vault-darker flex items-center justify-center">
                <User size={40} className="text-vault-green" />
              </div>
            )}
          </div>
          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-vault-green/20 blur-2xl rounded-full -z-0 scale-110" />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            {user?.name || 'Vault Member'}
          </h1>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Mail size={14} />
            {user?.email || 'member@vaultexp.com'}
          </p>
        </div>
      </section>

      {/* ── 2. Quick Settings ──────────────────────────────────── */}
      <section className="px-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2">Quick Settings</h2>
        
        <div className="glass-card-mobile divide-y divide-white/5 overflow-hidden">
          <div 
            onClick={toggleTheme}
            className="flex items-center justify-between p-4 active:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                {(user?.settings?.theme || 'dark') === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {(user?.settings?.theme || 'dark') === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-[10px] text-gray-500 italic">Adjust for your environment</p>
              </div>
            </div>
            <div className={cn(
              "w-10 h-5 rounded-full p-1 border transition-all relative",
              (user?.settings?.theme || 'dark') === 'dark' 
                ? "bg-vault-green/20 border-vault-green/30" 
                : "bg-gray-200 border-gray-300"
            )}>
              <motion.div 
                animate={{ x: (user?.settings?.theme || 'dark') === 'dark' ? 20 : 0 }}
                className={cn(
                  "w-3 h-3 rounded-full",
                  (user?.settings?.theme || 'dark') === 'dark' ? "bg-vault-green" : "bg-gray-400"
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-vault-green/10 flex items-center justify-center text-vault-green border border-vault-green/20">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-[10px] text-gray-500 italic">Push & email alerts</p>
              </div>
            </div>
            <div className="w-10 h-5 bg-vault-green/20 rounded-full p-1 border border-vault-green/30 relative">
              <div className="w-3 h-3 bg-vault-green rounded-full absolute right-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Preferences ─────────────────────────────────────── */}
      <section className="px-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2">Preferences</h2>
        
        <div className="glass-card-mobile divide-y divide-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Palette size={18} />
              </div>
              <p className="text-sm font-medium text-white">Accent Color</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10">
              <div 
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm" 
                style={{ backgroundColor: user?.settings?.accentColor || '#00FF88' }} 
              />
              <ChevronRight size={14} className="text-gray-600" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Layout size={18} />
              </div>
              <p className="text-sm font-medium text-white">Layout Mode</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              {user?.settings?.layoutPreference === 'list' ? 'List View' : 'Grid View'}
              <ChevronRight size={14} className="text-gray-600" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Account Actions ─────────────────────────────────── */}
      <section className="px-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2">Account</h2>
        
        <div className="glass-card-mobile overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:bg-vault-green/20 group-hover:text-vault-green transition-colors">
                <Edit2 size={18} />
              </div>
              <p className="text-sm font-medium text-white">Edit Profile</p>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors text-left group border-t border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <LogOut size={18} />
              </div>
              <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">Logout</p>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="text-center px-8 opacity-40">
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
          <ShieldCheck size={12} />
          Secure Session Active
          <span className="mx-1">•</span>
          <Smartphone size={12} />
          v1.0.4-beta
        </div>
      </footer>
    </motion.div>
  );
}
