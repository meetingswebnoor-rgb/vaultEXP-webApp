'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Sparkles, AlertCircle, Calendar, DollarSign, FileWarning, HelpCircle,
  Play, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CheckSquare, SearchCode
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const fmtDate = (str: string) => {
  const d = new Date(str);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getNotifIcon = (type: string) => {
  if (type === 'overdue_alert')     return <DollarSign className="w-4 h-4 text-red-400" />;
  if (type === 'lease_expiration')  return <Calendar className="w-4 h-4 text-amber-400" />;
  if (type === 'unusual_expense')   return <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />;
  if (type === 'missing_document')  return <FileWarning className="w-4 h-4 text-blue-400" />;
  return <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />; // tax_reminder
};

const getNotifClass = (severity: string) => {
  if (severity === 'high') return 'border-red-500/20 bg-red-500/[0.03] hover:border-red-500/40';
  if (severity === 'medium') return 'border-indigo-500/20 bg-indigo-500/[0.03] hover:border-indigo-500/40';
  return 'border-zinc-500/20 bg-zinc-500/[0.02] hover:border-zinc-500/30';
};

export function AINotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [suggestions, setSuggestions]     = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  
  const router = useRouter();

  const fetchNotifs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/notifications');
      const data = res.data?.data;
      if (data) {
        setNotifications(data.notifications || []);
        setSuggestions(data.suggestions || []);
      }
    } catch {
      setError('Failed to fetch intelligence notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleSuggestionCta = (route: string) => {
    router.push(route);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-vault-green animate-spin" />
        <p className="text-zinc-400 text-xs">AI engine is processing transactional standard deviations & lease turnover risks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300">{error}</p>
        <button onClick={fetchNotifs} className="ml-auto text-xs text-red-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* ── Left/Middle Panel: AI Notification Center ── */}
      <div className="lg:col-span-2 space-y-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Bell className="w-4 h-4 text-vault-green animate-pulse" /> Active AI Alert Center ({notifications.length})
        </h4>

        <div className="space-y-3">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              whileHover={{ x: 2 }}
              className={`border rounded-2xl p-4 flex gap-4 transition-all ${getNotifClass(notif.severity)}`}
            >
              <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-center flex-shrink-0 self-start mt-0.5">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-white leading-none">{notif.title}</span>
                  <span className="text-[8px] text-zinc-500 font-bold">{fmtDate(notif.timestamp)}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{notif.message}</p>
              </div>
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-8 text-center">
              <ShieldCheck className="w-8 h-8 text-vault-green mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Your estate audit returned 100% healthy status. No active alert warnings.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: AI Smart Suggestion Feed ── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Suggestions ({suggestions.length})
        </h4>

        <div className="space-y-3.5">
          {suggestions.map(sug => (
            <motion.div
              key={sug.id}
              whileHover={{ y: -1 }}
              className="bg-gradient-to-br from-indigo-950/20 via-indigo-900/5 to-transparent border border-indigo-500/15 rounded-2xl p-5 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-300`}>
                    {sug.category}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">{sug.title}</h5>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{sug.description}</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSuggestionCta(sug.route)}
                className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/30 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
              >
                {sug.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-center text-[10px] text-zinc-500 py-6">No suggestions queued.</p>
          )}
        </div>
      </div>

    </div>
  );
}
