'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Layout, 
  Shield, 
  Check, 
  Upload, 
  Mail,
  Palette,
  Monitor
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

type Tab = 'profile' | 'preferences' | 'notifications';

export function DesktopSettings() {
  const { user, updateSettings } = useAuthStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'preferences',   label: 'Preferences',   icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile settings saved successfully');
    }, 1200);
  };

  const handlePreferenceUpdate = (updates: any) => {
    updateSettings(updates);
    showToast('Preference updated', 'info');
  };

  return (
    <div className="flex gap-8 h-full">
      {/* ── Left: Sidebar Navigation ────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                active 
                  ? "bg-vault-green/10 text-vault-green border border-vault-green/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className={cn(active ? "text-vault-green" : "text-gray-500 group-hover:text-gray-300")} />
              {tab.label}
              {active && (
                <motion.div 
                  layoutId="active-tab" 
                  className="ml-auto w-1 h-4 bg-vault-green rounded-full" 
                />
              )}
            </button>
          );
        })}
      </aside>

      {/* ── Right: Content Panel ────────────────────────────── */}
      <main className="flex-1 max-w-3xl">
        <div className="glass-card p-8 min-h-[500px] flex flex-col relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-vault-green/5 blur-[100px] rounded-full" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-white capitalize">
                  {activeTab} Settings
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'profile' && 'Manage your personal identity and account details.'}
                  {activeTab === 'preferences' && 'Customize the look and feel of your Vault experience.'}
                  {activeTab === 'notifications' && 'Control how and when you receive system updates.'}
                </p>
              </div>

              {/* Panel Content */}
              <div className="space-y-8">
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-vault-dark border border-white/10 flex items-center justify-center overflow-hidden">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-gray-600" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 bg-vault-green text-black p-2 rounded-lg shadow-lg hover:scale-105 transition-transform">
                          <Upload size={14} />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Profile Picture</h4>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF. Max 2MB.</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={user?.name}
                            className="w-full bg-vault-darker border border-white/10 rounded-xl px-4 py-3 text-white focus:border-vault-green/50 outline-none transition-colors" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            disabled
                            defaultValue={user?.email}
                            className="w-full bg-vault-darker border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" 
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-vault-green/10 text-vault-green px-2 py-0.5 rounded border border-vault-green/20">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-8">
                    {/* Theme Selector */}
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Interface Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'dark',   label: 'Dark',   icon: Moon },
                          { id: 'light',  label: 'Light',  icon: Sun },
                          { id: 'system', label: 'System', icon: Monitor },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handlePreferenceUpdate({ theme: t.id as any })}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                              (user?.settings?.theme || 'dark') === t.id 
                                ? "bg-vault-green/10 border-vault-green/30 text-white" 
                                : "bg-vault-dark border-white/5 text-gray-400 hover:border-white/20"
                            )}
                          >
                            <t.icon size={20} />
                            <span className="text-sm font-medium">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color Selector */}
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Accent Color</label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { id: 'vault-green',   hex: '#00FF88' },
                          { id: 'electric-blue', hex: '#3B82F6' },
                          { id: 'cyber-purple',  hex: '#A855F7' },
                          { id: 'sunset-orange', hex: '#F97316' },
                          { id: 'ruby-red',      hex: '#EF4444' },
                        ].map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handlePreferenceUpdate({ accentColor: color.hex })}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                              user?.settings?.accentColor === color.hex 
                                ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                                : "border-transparent"
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.id.replace('-', ' ')}
                          />
                        ))}
                        {/* Custom Color Input */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all">
                          <input 
                            type="color" 
                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                            value={user?.settings?.accentColor || '#00FF88'}
                            onChange={(e) => handlePreferenceUpdate({ accentColor: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Layout Selector */}
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Default View</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center gap-4 p-4 rounded-2xl border border-vault-green/30 bg-vault-green/10 text-white">
                          <Layout size={20} className="text-vault-green" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Grid View</p>
                            <p className="text-[10px] text-gray-500 italic">Card-based dashboard</p>
                          </div>
                          <Check size={16} className="ml-auto text-vault-green" />
                        </button>
                        <button className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-vault-dark text-gray-400 hover:border-white/20">
                          <Layout size={20} />
                          <div className="text-left">
                            <p className="text-sm font-medium">List View</p>
                            <p className="text-[10px] text-gray-500 italic">Compact data rows</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    {[
                      { id: 'email', label: 'Email Notifications', desc: 'Receive weekly summaries and transaction alerts.' },
                      { id: 'push',  label: 'Push Notifications',  desc: 'Get real-time updates on mobile and desktop.' },
                      { id: 'sms',   label: 'SMS Alerts',          desc: 'High-priority security and login notifications.' },
                    ].map((n) => (
                      <div key={n.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-white">{n.label}</h4>
                          <p className="text-xs text-gray-500">{n.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-vault-green/20 rounded-full p-1 border border-vault-green/30 relative cursor-pointer">
                          <div className="w-4 h-4 bg-vault-green rounded-full absolute right-1 shadow-[0_0_8px_rgba(0,255,136,0.4)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSave}
                  className={cn(
                    "relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all",
                    isSaving 
                      ? "bg-gray-700 text-gray-400 cursor-wait" 
                      : "bg-vault-green text-black hover:bg-vault-green-hover hover:scale-105 active:scale-95"
                  )}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
