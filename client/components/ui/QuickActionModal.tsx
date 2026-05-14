'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Building2, CreditCard, UploadCloud, ChevronRight, Receipt, FileText } from 'lucide-react';
import { useActionStore, ActionType } from '@/store/actionStore';
import { useRouter } from 'next/navigation';

const ACTION_CONFIGS: Record<NonNullable<ActionType>, { title: string; icon: any; color: string; desc: string }> = {
  business: {
    title: 'Add New Business',
    desc: 'Register a new corporate entity or venture to your portfolio.',
    icon: Briefcase,
    color: '#FB923C' // orange
  },
  property: {
    title: 'Add Property',
    desc: 'Record a new real estate asset for tracking and valuation.',
    icon: Building2,
    color: '#3B82F6' // blue
  },
  card: {
    title: 'Link Payment Card',
    desc: 'Securely link a new credit or debit card to your Vault.',
    icon: CreditCard,
    color: '#00FF88' // vault green
  },
  document: {
    title: 'Upload Document',
    desc: 'Securely store a sensitive legal or financial document.',
    icon: UploadCloud,
    color: '#A855F7' // purple
  },
  expense: {
    title: 'Add Expense',
    desc: 'Log a business expense to keep your books balanced.',
    icon: Receipt,
    color: '#F87171' // red/rose
  },
  invoice: {
    title: 'Create Invoice',
    desc: 'Generate a new invoice for your clients.',
    icon: FileText,
    color: '#3B82F6' // blue
  }
};

export function QuickActionModal() {
  const { activeAction, closeAction } = useActionStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {activeAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAction}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-vault-card border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 flex flex-col"
          >
            {(() => {
              const config = ACTION_CONFIGS[activeAction];
              const Icon = config.icon;
              
              return (
                <>
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-white/5 flex items-start justify-between relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 pointer-events-none rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                        style={{ 
                          backgroundColor: `${config.color}15`, 
                          borderColor: `${config.color}30`,
                          color: config.color
                        }}
                      >
                        <Icon size={24} strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-bold text-white">{config.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-snug max-w-[200px]">
                          {config.desc}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={closeAction}
                      className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors relative z-10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const currentAction = activeAction;
                      
                      // Mock transition delay for premium feel
                      setTimeout(() => {
                        closeAction();
                        
                        // Navigate to relevant section
                        if (currentAction === 'property') router.push('/property');
                        if (currentAction === 'business') router.push('/business');
                        if (currentAction === 'expense') router.push('/property'); // Typically expenses are per property
                        if (currentAction === 'invoice') router.push('/business');
                      }, 400);
                    }}
                    className="px-8 py-8 space-y-5"
                  >
                    {activeAction === 'expense' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Amount</label>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Category</label>
                            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-400 focus:border-vault-green/50 appearance-none">
                              <option>Operational</option>
                              <option>Marketing</option>
                              <option>Software</option>
                              <option>Payroll</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Notes / Description</label>
                          <textarea 
                            placeholder="What was this for?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 h-24 resize-none"
                          />
                        </div>
                      </>
                    ) : activeAction === 'invoice' ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Client Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Acme Corp"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Total Amount</label>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Due Date</label>
                            <input 
                              type="date" 
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-400 focus:border-vault-green/50 appearance-none"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                          Asset Name
                        </label>
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="e.g. Acme Corporation" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-vault-green/50 transition-colors"
                        />
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      onClick={() => {
                        if (activeAction !== 'expense' && activeAction !== 'invoice') {
                          setTimeout(() => {
                            const section = document.getElementById("overview-section");
                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                          }, 450);
                        }
                      }}
                      className="w-full mt-2 flex items-center justify-between px-6 py-4 rounded-xl font-bold text-sm text-black transition-all group"
                      style={{ 
                        backgroundColor: config.color,
                        boxShadow: `0 8px 24px ${config.color}30`
                      }}
                    >
                      <span>
                        {activeAction === 'expense' ? 'Save Expense' : 
                         activeAction === 'invoice' ? 'Create Invoice' : 
                         'Continue Setup'}
                      </span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
