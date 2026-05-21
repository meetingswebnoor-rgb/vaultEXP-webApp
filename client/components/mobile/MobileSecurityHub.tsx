'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Fingerprint, Smartphone, Laptop, 
  Trash2, AlertOctagon, Lock, EyeOff 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Mock data for demo purposes. In a real app, this would be fetched from the DB `Device` and `Session` models.
const MOCK_SESSIONS = [
  { id: '1', deviceName: 'iPhone 15 Pro', os: 'iOS 17.4', current: true, lastActive: 'Just now', icon: Smartphone },
  { id: '2', deviceName: 'MacBook Pro', os: 'macOS 14.2', current: false, lastActive: '2 hours ago', icon: Laptop },
  { id: '3', deviceName: 'Chrome (Windows)', os: 'Windows 11', current: false, lastActive: 'Yesterday', icon: Laptop },
];

export function MobileSecurityHub() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleBiometricToggle = () => {
    // In a real app, this would trigger WebAuthn navigator.credentials.create()
    setBiometricEnabled(!biometricEnabled);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 pb-24">
      {/* 1. Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 p-6 shadow-[0_10px_40px_rgba(99,102,241,0.1)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={28} className="text-indigo-400" />
          <h2 className="text-xl font-display font-bold text-white tracking-tight">Security Center</h2>
        </div>
        <p className="text-sm text-indigo-200/80 leading-relaxed mb-4">
          Your connection is secured with end-to-end local storage encryption.
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-full px-3 py-1 font-bold text-xs border border-indigo-500/30">
            Protected
          </span>
          <span className="flex items-center justify-center bg-vault-green/10 text-vault-green rounded-full px-3 py-1 font-bold text-xs border border-vault-green/20 gap-1">
            <Lock size={12} /> Encrypted
          </span>
        </div>
      </motion.div>

      {/* 2. Biometric Auth Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Fingerprint size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white">Biometric Unlock</h3>
            <p className="text-xs text-gray-400 mt-0.5">Require FaceID / TouchID</p>
          </div>
        </div>

        {/* Custom Toggle Switch */}
        <button 
          onClick={handleBiometricToggle}
          className={cn(
            "w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shadow-inner",
            biometricEnabled ? "bg-vault-green" : "bg-white/10"
          )}
        >
          <motion.div 
            layout
            className="w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ x: biometricEnabled ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </motion.div>

      {/* 3. Threat Alerts (AI Anomaly Detection) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-black/40 border border-orange-500/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] pointer-events-none" />
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <AlertOctagon size={18} className="text-orange-400" /> 
          Recent Threat Alerts
        </h3>
        
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-orange-400">Low Risk:</strong> Unusual login time detected yesterday at 2:00 AM. Access was granted successfully via secondary 2FA token. No further action needed.
          </p>
        </div>
      </motion.div>

      {/* 4. Active Sessions Management */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-white mb-4 px-2 flex items-center gap-2">
          <EyeOff size={18} className="text-gray-400" />
          Active Sessions
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {sessions.map((session) => {
              const Icon = session.icon;
              return (
                <motion.div 
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {session.deviceName}
                        {session.current && (
                          <span className="text-[9px] uppercase tracking-wider font-black text-vault-green bg-vault-green/10 border border-vault-green/20 px-2 py-0.5 rounded-full">
                            This Device
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{session.os} • {session.lastActive}</p>
                    </div>
                  </div>

                  {!session.current && (
                    <button 
                      onClick={() => revokeSession(session.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Revoke Access"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {sessions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No active sessions.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
