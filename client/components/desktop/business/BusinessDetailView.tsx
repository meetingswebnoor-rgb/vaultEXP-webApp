'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Receipt, FileText, UploadCloud, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AIBusinessAdvisor } from '@/components/business/AIBusinessAdvisor';

interface BusinessDetailViewProps {
  business: any;
}

export function BusinessDetailView({ business }: BusinessDetailViewProps) {
  const [activeTab, setActiveTab] = useState('expenses');
  const router = useRouter();

  if (!business) return null;

  const businessId = business.id || business._id;

  return (
    <div className="flex-1 overflow-y-auto bg-vault-dark/40">
      <div className="p-10 max-w-7xl mx-auto">
        {/* Header / Overview Grid */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">{business.name}</h1>
            <p className="text-gray-500 font-medium">{business.type} • Active Entity</p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all">
              Edit Details
            </button>
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/30 text-white text-sm font-bold shadow-lg shadow-indigo-500/10 transition-all flex items-center gap-2"
            >
              <Sparkles size={15} /> AI Advisor
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Annual Revenue" value={business.revenue} icon={TrendingUp} color="green" delta="+12.4%" />
          <StatCard title="Monthly Expenses" value={business.expenses} icon={TrendingDown} color="red" delta="-2.1%" />
          <StatCard title="Net Profit" value="$24,300" icon={DollarSign} color="blue" delta="+5.2%" />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mb-8">
           <ActionButton label="Add Expense" icon={Receipt} color="orange" onClick={() => router.push('/wallet')} />
           <ActionButton label="Create Invoice" icon={FileText} color="blue" onClick={() => router.push('/business')} />
           <ActionButton label="Upload Document" icon={UploadCloud} color="purple" onClick={() => router.push('/documents')} />
           <ActionButton label="AI Insights" icon={Sparkles} color="indigo" onClick={() => setActiveTab('ai-advisor')} />
        </div>

        {/* Tabs System */}
        <div className="border-b border-vault-border/40 mb-8 flex gap-8">
          {['expenses', 'invoices', 'documents', 'ai-advisor'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-1.5",
                activeTab === tab ? "text-vault-green" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab === 'ai-advisor' && <Sparkles size={12} />}
              {tab.replace('-', ' ')}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-vault-green" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[400px]"
          >
            {activeTab === 'expenses'   && <ExpenseTable />}
            {activeTab === 'invoices'   && <InvoiceGrid />}
            {activeTab === 'documents'  && <DocumentGrid />}
            {activeTab === 'ai-advisor' && businessId && (
              <AIBusinessAdvisor businessId={businessId} businessName={business.name} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, delta }: any) {
  const colors = {
    green: 'text-vault-green bg-vault-green/10 border-vault-green/20',
    red:   'text-red-400 bg-red-500/10 border-red-500/20',
    blue:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange:'text-orange-400 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="bg-vault-card/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colors[color as keyof typeof colors])}>
          <Icon size={20} />
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg bg-black/40 border border-white/5", delta.startsWith('+') ? 'text-vault-green' : 'text-red-400')}>
          {delta}
        </span>
      </div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ActionButton({ label, icon: Icon, color, onClick }: any) {
  const colors = {
    orange: 'hover:text-orange-400 hover:border-orange-500/40',
    blue:   'hover:text-blue-400 hover:border-blue-500/40',
    purple: 'hover:text-purple-400 hover:border-purple-500/40',
    indigo: 'hover:text-indigo-400 hover:border-indigo-500/40',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all group",
        colors[color as keyof typeof colors]
      )}
    >
      <Icon size={18} className="text-gray-500 group-hover:text-inherit" />
      <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function ExpenseTable() {
  return (
    <div className="bg-vault-card/40 border border-white/5 rounded-3xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/5 border-b border-white/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {[1,2,3,4,5].map(i => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
              <td className="px-6 py-4 text-xs text-gray-400">May 0{i}, 2024</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">Software</span>
              </td>
              <td className="px-6 py-4 text-sm text-white font-medium">Cloud Subscription - Tier 0{i}</td>
              <td className="px-6 py-4 text-sm font-bold text-white text-right">$450.00</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceGrid() {
  return <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl">No invoices found for this period.</div>;
}

function DocumentGrid() {
  return <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl">No documents uploaded.</div>;
}
