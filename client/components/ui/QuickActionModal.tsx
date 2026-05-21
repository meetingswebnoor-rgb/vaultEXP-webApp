'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Building2, CreditCard, UploadCloud, ChevronRight, Receipt, FileText, User, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { useActionStore, ActionType } from '@/store/actionStore';
import { AddBusinessForm } from '@/components/forms/AddBusinessForm';
import { AddPropertyForm } from '@/components/forms/AddPropertyForm';
import { AddWalletForm } from '@/components/forms/AddWalletForm';
import { AddInvestmentForm } from '@/components/forms/AddInvestmentForm';
import { AddTenantForm } from '@/components/forms/AddTenantForm';
import { AddDocumentForm } from '@/components/forms/AddDocumentForm';
import { AddExpenseForm } from '@/components/forms/AddExpenseForm';
import { AddInvoiceForm } from '@/components/forms/AddInvoiceForm';
import { LogTransactionForm } from '@/components/forms/LogTransactionForm';

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
    desc: 'Log a business or property expense to keep your books balanced.',
    icon: Receipt,
    color: '#F87171' // red/rose
  },
  invoice: {
    title: 'Create Invoice',
    desc: 'Generate a new invoice for your clients.',
    icon: FileText,
    color: '#3B82F6' // blue
  },
  tenant: {
    title: 'Add Tenant',
    desc: 'Register a new tenant to your property.',
    icon: User,
    color: '#00FF88'
  },
  investment: {
    title: 'New Investment',
    desc: 'Track a new stock, crypto or asset.',
    icon: TrendingUp,
    color: '#F59E0B'
  },
  wallet: {
    title: 'Create Wallet',
    desc: 'Add a new digital or fiat wallet.',
    icon: Wallet,
    color: '#00FF88'
  },
  transaction: {
    title: 'Log Transaction',
    desc: 'Record a manual transfer or payment.',
    icon: Receipt,
    color: '#3B82F6'
  },
  alert: {
    title: 'Set Alert',
    desc: 'Configure a notification for your assets.',
    icon: AlertCircle,
    color: '#F87171'
  }
};

export function QuickActionModal() {
  const { activeAction, closeAction } = useActionStore();

  const renderForm = () => {
    switch (activeAction) {
      case 'business':   return <AddBusinessForm />;
      case 'property':   return <AddPropertyForm />;
      case 'wallet':     return <AddWalletForm />;
      case 'investment': return <AddInvestmentForm />;
      case 'tenant':     return <AddTenantForm />;
      case 'document':   return <AddDocumentForm />;
      case 'expense':    return <AddExpenseForm />;
      case 'invoice':    return <AddInvoiceForm />;
      case 'transaction': return <LogTransactionForm />;
      // Fallback for actions not yet fully implemented with dedicated forms
      default: return (
        <div className="px-8 py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-white font-semibold">Action Not Ready</h4>
          <p className="text-xs text-gray-400">The &quot;{activeAction}&quot; module is currently under development.</p>
          <button 
            onClick={closeAction}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10"
          >
            Go Back
          </button>
        </div>
      );
    }
  };

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
            className="relative w-full max-w-lg bg-vault-card border border-white/[0.08] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]"
          >
            {(() => {
              const config = ACTION_CONFIGS[activeAction];
              const Icon = config.icon;
              
              return (
                <>
                  {/* Header */}
                  <div className="px-8 py-7 border-b border-white/[0.05] flex items-start justify-between relative overflow-hidden bg-white/[0.01]">
                    {/* Ambient Glow */}
                    <div 
                      className="absolute top-0 right-0 w-48 h-48 blur-[60px] opacity-20 pointer-events-none rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    
                    <div className="flex items-center gap-5 relative z-10">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner"
                        style={{ 
                          backgroundColor: `${config.color}15`, 
                          borderColor: `${config.color}30`,
                          color: config.color
                        }}
                      >
                        <Icon size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-white tracking-tight">{config.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[240px]">
                          {config.desc}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={closeAction}
                      className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all relative z-10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Form Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {renderForm()}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
