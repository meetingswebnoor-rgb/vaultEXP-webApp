'use client';

import React from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Landmark, Receipt, CreditCard, PieChart, 
  ArrowRightLeft, FileSpreadsheet, Vault, Network
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileFinanceHub } from '@/components/mobile/MobileFinanceHub';

const FIN_MODULES = [
  { name: 'Accounting Ledger', icon: BookOpen, desc: 'Double-entry auto-balancing engine.', color: 'text-vault-green', bg: 'bg-vault-green/10', border: 'border-vault-green/20' },
  { name: 'Invoicing', icon: Receipt, desc: 'Enterprise billing and dynamic tax rates.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'Payment Gateway', icon: CreditCard, desc: 'Card processing and ACH wire transfers.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { name: 'Financial Reports', icon: PieChart, desc: 'Automated P&L and Balance Sheet generation.', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { name: 'Reconciliation', icon: ArrowRightLeft, desc: 'Bank statement auto-matching.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { name: 'Tax Engine', icon: FileSpreadsheet, desc: 'Real-time tax liability calculation.', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { name: 'Treasury', icon: Vault, desc: 'Multi-wallet currency management.', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { name: 'Integrations', icon: Network, desc: 'Stripe, Plaid, and core CRM hooks.', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
];

// Need to import BookOpen separately
import { BookOpen } from 'lucide-react';

export default function FinancialOSPage() {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return (
      <PageContainer>
        <div className="mb-4 mt-2 px-4">
          <PageHeader 
            title="Financial OS" 
            description="Your mobile command center." 
          />
        </div>
        <MobileFinanceHub />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Financial Operating System" 
          description="The centralized nervous system for all VaultEXP capital flow." 
        />
        <div className="flex gap-3">
          <button className="bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-6 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            Create Invoice
          </button>
        </div>
      </div>

      {/* Main Architecture Graphic */}
      <div className="bg-[#080C0F]/65 border border-white/5 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-gradient-to-r from-vault-green/5 via-blue-500/5 to-purple-500/5 blur-[80px] pointer-events-none" />
        
        <div className="w-32 h-32 rounded-full border border-white/10 bg-black/40 flex items-center justify-center flex-shrink-0 relative z-10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <Landmark size={48} className="text-white opacity-80" />
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Connected Financial Ecosystem</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            VaultEXP&apos;s underlying architecture has been fully upgraded to support strict double-entry accounting. The existing Wallet and Transaction layers have been bridged into a robust enterprise ledger, ensuring perfect auditability without duplicate data.
          </p>
        </div>
      </div>

      {/* Sub-modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {FIN_MODULES.map((mod) => (
          <div key={mod.name} className="bg-vault-card border border-white/5 rounded-2xl p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer">
            <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-110", mod.bg, mod.border, mod.color)}>
              <mod.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{mod.name}</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {mod.desc}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
