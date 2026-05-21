'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Loader2, Bell, Smartphone, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Preference {
  type: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>('checking'); // checking, granted, denied

  // Initialize with defaults if none exist
  const defaultTypes = ['AI_ALERT', 'INVOICE', 'CRM', 'MENTION', 'SYSTEM'];

  useEffect(() => {
    fetchPreferences();
    checkPushPermissions();
  }, []);

  const checkPushPermissions = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    } else {
      setPushStatus('unsupported');
    }
  };

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPushStatus(perm);
      if (perm === 'granted') {
        // Here we would typically get the FCM token and send it to the backend
        // For Expo, we handle it natively.
      }
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await api.get('/api/notifications/preferences');
      const prefs = res.data.data.preferences;
      
      const merged = defaultTypes.map(type => {
        const existing = prefs.find((p: any) => p.type === type);
        return existing || { type, pushEnabled: true, emailEnabled: false };
      });
      
      setPreferences(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = async (type: string, field: 'pushEnabled' | 'emailEnabled', currentValue: boolean) => {
    setSavingType(type);
    try {
      const currentPref = preferences.find(p => p.type === type)!;
      const payload = {
        type,
        pushEnabled: field === 'pushEnabled' ? !currentValue : currentPref.pushEnabled,
        emailEnabled: field === 'emailEnabled' ? !currentValue : currentPref.emailEnabled,
      };

      await api.put('/api/notifications/preferences', payload);
      
      setPreferences(prev => prev.map(p => p.type === type ? payload : p));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingType(null);
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case 'AI_ALERT': return 'AI Proactive Alerts';
      case 'INVOICE': return 'Invoice Reminders';
      case 'CRM': return 'CRM Activity';
      case 'MENTION': return 'Team Mentions';
      case 'SYSTEM': return 'System Maintenance';
      default: return type;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin text-vault-green" size={32} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Settings" 
        description="Control exactly how and when VaultEXP alerts you." 
      />

      <div className="max-w-4xl space-y-8 mt-6">
        
        {/* Device Push Registration Alert */}
        {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex items-start gap-4"
          >
            <AlertTriangle className="text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-orange-100 font-bold mb-1">Push Notifications Disabled</h3>
              <p className="text-sm text-orange-200/80 mb-3">
                You won&apos;t receive desktop notifications. Enable them to stay updated instantly.
              </p>
              <button 
                onClick={requestPushPermission}
                className="bg-orange-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-400 transition-colors"
              >
                Enable Push Notifications
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-vault-green" /> Delivery Preferences
            </h2>
          </div>
          
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-12 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/[0.01]">
              <div className="col-span-6">Alert Type</div>
              <div className="col-span-3 text-center flex items-center justify-center gap-2"><Smartphone size={14} /> Push</div>
              <div className="col-span-3 text-center flex items-center justify-center gap-2"><Mail size={14} /> Email</div>
            </div>

            {preferences.map((pref) => (
              <div key={pref.type} className="grid grid-cols-12 p-5 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-6">
                  <h3 className="font-bold text-white text-sm">{getLabelForType(pref.type)}</h3>
                  <p className="text-xs text-gray-400 mt-1">Receive alerts regarding {getLabelForType(pref.type).toLowerCase()}.</p>
                </div>
                
                {/* Push Toggle */}
                <div className="col-span-3 flex justify-center">
                  <button 
                    disabled={savingType === pref.type}
                    onClick={() => togglePreference(pref.type, 'pushEnabled', pref.pushEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${pref.pushEnabled ? 'bg-vault-green' : 'bg-white/10'} ${savingType === pref.type ? 'opacity-50' : ''}`}
                  >
                    <motion.div 
                      layout
                      initial={false}
                      animate={{ x: pref.pushEnabled ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm"
                    />
                  </button>
                </div>

                {/* Email Toggle */}
                <div className="col-span-3 flex justify-center">
                  <button 
                    disabled={savingType === pref.type}
                    onClick={() => togglePreference(pref.type, 'emailEnabled', pref.emailEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${pref.emailEnabled ? 'bg-blue-500' : 'bg-white/10'} ${savingType === pref.type ? 'opacity-50' : ''}`}
                  >
                    <motion.div 
                      layout
                      initial={false}
                      animate={{ x: pref.emailEnabled ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
