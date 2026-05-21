'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Clock, AlertTriangle, FileText, CheckCircle2, ChevronRight, Link } from 'lucide-react';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { cn } from '@/lib/utils/cn';

interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  documentName: string;
  documentId: string;
  isCompleted: boolean;
  aiGenerated: boolean;
}

const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    title: 'Q4 Estimated Tax Payment Due',
    date: '2026-01-15',
    type: 'tax_deadline',
    priority: 'critical',
    documentName: 'Q4_2025_Tax_Filing.pdf',
    documentId: 'd1',
    isCompleted: false,
    aiGenerated: true
  },
  {
    id: 'r2',
    title: 'Commercial Lease Renewal Option Expires',
    date: '2026-08-10',
    type: 'lease_expiry',
    priority: 'high',
    documentName: 'Commercial_Lease_Agreement_101.docx',
    documentId: 'd2',
    isCompleted: false,
    aiGenerated: true
  },
  {
    id: 'r3',
    title: 'Vendor Invoice Payment Due',
    date: '2025-11-05',
    type: 'invoice_due',
    priority: 'medium',
    documentName: 'Q3_Expense_Report.xlsx',
    documentId: 'd3',
    isCompleted: true,
    aiGenerated: true
  }
];

export function ReminderCenter() {
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  const pendingReminders = reminders.filter(r => !r.isCompleted).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedReminders = reminders.filter(r => r.isCompleted);

  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">High</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Medium</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-vault-card border border-vault-border p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <VaultAIOrb size={24} glow animated compact />
            <h2 className="text-xl font-display font-bold text-white">AI Reminder Center</h2>
          </div>
          <p className="text-sm text-gray-500 ml-9">Dates and deadlines automatically extracted from your documents.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05]">
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-bold text-vault-green">{pendingReminders.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pending</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-bold text-gray-400">{completedReminders.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Completed</span>
          </div>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-vault-green/50 before:via-vault-green/20 before:to-transparent">
        
        {pendingReminders.map((reminder, idx) => (
          <motion.div 
            key={reminder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Timeline Node */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-vault-dark border-4 border-vault-card shadow-[0_0_15px_rgba(0,255,136,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
              <Calendar size={14} className="text-vault-green" />
            </div>

            {/* Content Card */}
            <div className="w-full pl-10 md:pl-0 md:w-5/12 ml-6 md:ml-0">
              <div className="bg-vault-card border border-vault-border hover:border-vault-green/30 p-5 rounded-2xl transition-all shadow-lg hover:shadow-xl group-hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={reminder.priority} />
                    {reminder.aiGenerated && (
                      <span className="flex items-center gap-1 text-[10px] text-vault-green font-bold uppercase tracking-wider bg-vault-green/10 px-2 py-0.5 rounded">
                        <VaultAIOrb size={10} glow={false} compact /> AI Detected
                      </span>
                    )}
                  </div>
                  <button onClick={() => toggleComplete(reminder.id)} className="text-gray-500 hover:text-vault-green transition-colors">
                    <CheckCircle2 size={20} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{reminder.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-red-400 mb-4 font-semibold">
                  <Clock size={14} />
                  {new Date(reminder.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {/* Linked Document */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] group/doc cursor-pointer hover:bg-white/[0.05] transition-colors">
                  <FileText size={16} className="text-gray-400 group-hover/doc:text-vault-green transition-colors" />
                  <span className="text-[12px] text-gray-300 font-medium truncate flex-1">{reminder.documentName}</span>
                  <Link size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {completedReminders.length > 0 && (
          <div className="relative flex items-center justify-center my-8">
            <div className="bg-vault-dark px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest border border-vault-border rounded-full z-10">
              Completed
            </div>
          </div>
        )}

        {completedReminders.map((reminder) => (
          <motion.div 
            key={reminder.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50 hover:opacity-100 transition-opacity"
          >
            {/* Timeline Node */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-vault-dark border-4 border-vault-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
              <CheckCircle2 size={14} className="text-gray-500" />
            </div>

            {/* Content Card */}
            <div className="w-full pl-10 md:pl-0 md:w-5/12 ml-6 md:ml-0">
              <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase line-through">{reminder.title}</span>
                  <button onClick={() => toggleComplete(reminder.id)} className="text-vault-green">
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Clock size={12} /> {new Date(reminder.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}
