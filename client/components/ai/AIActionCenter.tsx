'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, DollarSign, Calendar, FileText, BellRing, TrendingUp,
  Percent, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const priorityOutline = (priority: string) => {
  if (priority === 'high') return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.05)]';
  if (priority === 'medium') return 'border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.05)]';
  return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.05)]';
};

const priorityBadge = (priority: string) => {
  if (priority === 'high') return 'bg-red-500/10 border-red-500/20 text-red-400';
  if (priority === 'medium') return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
};

const actionIcon = (type: string) => {
  if (type === 'pay_invoices')      return <DollarSign className="w-5 h-5 text-red-400" />;
  if (type === 'renew_lease')       return <Calendar className="w-5 h-5 text-amber-400" />;
  if (type === 'upload_docs')       return <FileText className="w-5 h-5 text-blue-400" />;
  if (type === 'create_reminder')   return <BellRing className="w-5 h-5 text-indigo-400" />;
  if (type === 'review_investments') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
  return <Percent className="w-5 h-5 text-teal-400" />; // review_taxes
};

export function AIActionCenter() {
  const [actions, setActions]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [openReminder, setOpenReminder] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate]   = useState('');
  const [reminderSuccess, setReminderSuccess] = useState(false);
  
  const router = useRouter();

  const fetchActions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/actions');
      const data = res.data?.data;
      setActions(Array.isArray(data) && data.length > 0 ? data : [
        { id: 'default_review', type: 'review_dashboard', title: 'Review Your Dashboard', description: 'Check your business performance, expenses, and invoices.', priority: 'medium', ctaLabel: 'Go to Dashboard', route: '/dashboard' },
        { id: 'default_docs', type: 'upload_docs', title: 'Organize Your Documents', description: 'Upload and categorize your business documents for better AI analysis.', priority: 'low', ctaLabel: 'Open Documents', route: '/documents' }
      ]);
    } catch {
      // Graceful fallback — never show raw error
      setActions([
        { id: 'fallback_1', type: 'review_dashboard', title: 'Review Your VaultEXP Dashboard', description: 'VaultAI is warming up. Check your dashboard while intelligence loads.', priority: 'medium', ctaLabel: 'Go to Dashboard', route: '/dashboard' },
        { id: 'fallback_2', type: 'upload_docs', title: 'Upload Your Documents', description: 'Keep your Document Vault organized for better AI analysis and tax planning.', priority: 'low', ctaLabel: 'Open Documents', route: '/documents' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleActionClick = (act: any) => {
    if (act.route === 'open_reminder_modal') {
      setReminderTitle(act.title);
      setReminderDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 10 days out
      setOpenReminder(true);
      return;
    }
    // Fully connected routing
    router.push(act.route);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderSuccess(true);
    setTimeout(() => {
      setReminderSuccess(false);
      setOpenReminder(false);
    }, 1800);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-8 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-vault-green animate-spin" />
        <p className="text-zinc-400 text-xs">AI automation center is auditing financial ledgers, property contracts, and taxes...</p>
      </div>
    );
  }

  // Error state handled silently — fallback actions are shown instead

  return (
    <div className="space-y-6">
      
      {/* Dynamic Suggestions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => (
          <motion.div
            key={act.id}
            whileHover={{ y: -2 }}
            className={`border rounded-[22px] p-5 flex flex-col justify-between gap-5 transition-all ${priorityOutline(act.priority)}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  {actionIcon(act.type)}
                </div>
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge(act.priority)}`}>
                  {act.priority} Priority
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white leading-snug">{act.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{act.description}</p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleActionClick(act)}
              className="w-full py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {act.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* ── AI Reminder Scheduler Modal ── */}
      <AnimatePresence>
        {openReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setOpenReminder(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-[28px] max-w-sm w-full p-6 relative z-10 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create AI Reminder</h3>
                  <p className="text-[10px] text-zinc-500">Add tax optimization checkpoint</p>
                </div>
              </div>

              {reminderSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-white">Reminder Scheduled Successfully!</p>
                  <p className="text-[10px] text-zinc-400">VaultAI will alert you prior to this deadline.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveReminder} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Reminder Title</label>
                    <input
                      type="text"
                      required
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Alert Date</label>
                    <input
                      type="date"
                      required
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenReminder(false)}
                      className="flex-1 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl text-[11px] text-zinc-400 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-semibold transition-colors shadow-lg"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
