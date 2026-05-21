'use client';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { SmartCalendar } from '@/components/reminders/SmartCalendar';
import { DeadlineTimeline } from '@/components/reminders/DeadlineTimeline';
import { BrainCircuit, Bell, Clock, FileText, CheckCircle2 } from 'lucide-react';

// Mock Data indicating what the backend queue evaluates
const mockDeadlines = [
  { title: 'Commercial Lease Expiration', description: 'Property 102 (Downtown Hub) lease expires. 60-day notice period approaching.', timeLeft: '12 days', category: 'lease', priority: 'high' },
  { title: 'Missing Tax Form (W-9)', description: 'AI detected missing W-9 for vendor "Apex Cleaners". Form is required before EOY filing.', timeLeft: 'AI Alert', category: 'ai', priority: 'high' },
  { title: 'Q3 Tax Estimates Due', description: 'Quarterly estimated tax payments for LLC holding accounts.', timeLeft: '15 days', category: 'tax', priority: 'normal' },
  { title: 'Unpaid Invoice #INV-2049', description: 'Client "TechCorp" payment is 5 days overdue.', timeLeft: 'Overdue', category: 'invoice', priority: 'high' },
  { title: 'Insurance Premium Auto-Renewal', description: 'Annual general liability insurance policy auto-renews.', timeLeft: '28 days', category: 'insurance', priority: 'normal' },
];

const mockEvents = [
  { date: 12, isAI: false },
  { date: 15, isAI: true },
  { date: 22, isAI: false },
  { date: 28, isAI: false }
];

export default function RemindersDashboard() {
  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5">
        <PageHeader 
          title="Intelligent Reminders" 
          description="AI-powered deadline tracking for taxes, leases, invoices, and automated subscriptions."
        />
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-sm hover:bg-indigo-500/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <BrainCircuit className="w-4 h-4" /> AI Auto-Scan
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-vault-green text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:scale-105 transition-all">
            <Bell className="w-4 h-4" /> Add Reminder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[750px]">
        
        {/* Left Column: Calendar & Insights */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <SmartCalendar events={mockEvents} />
          
          <div className="bg-vault-dark border border-white/5 rounded-[24px] p-6 shadow-xl flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 relative z-10">
              <FileText className="w-4 h-4 text-gray-400" /> Auto-Detected Insights
            </h3>
            
            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><BrainCircuit className="w-3.5 h-3.5"/> AI Scan Result</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  I scanned 14 recent documents. You have 2 expiring software subscriptions next month totaling <span className="text-white font-bold">$240/mo</span>. Consider canceling unused seats.
                </p>
              </div>
              
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Urgency Check</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your corporate tax deadline is approaching. Ensure all Q3 expense receipts are categorized and uploaded.
                </p>
              </div>

              <div className="p-4 bg-vault-green/5 border border-vault-green/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-vault-green uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Fully Audited</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All 24 active commercial leases have been successfully audited for renewal dates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Timeline */}
        <div className="xl:col-span-8 flex flex-col h-full">
          <DeadlineTimeline deadlines={mockDeadlines} />
        </div>
      </div>
    </PageContainer>
  );
}
