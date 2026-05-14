'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BusinessStatsHero } from '@/components/mobile/business/BusinessStatsHero';
import { BusinessActionGrid } from '@/components/mobile/business/BusinessActionGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'documents', label: 'Documents' },
];

export default function BusinessDashboardPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <PageContainer>
      <PageHeader 
        title="VaultTech Solutions" 
        description="LLC • Technology Sector" 
        showBack
      />

      <BusinessStatsHero 
        revenue="$28,500"
        expenses="$4,200"
        profit="$24,300"
      />

      <BusinessActionGrid />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all",
              activeTab === tab.id ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activeTab === 'expenses' && (
              <>
                <div className="flex items-center justify-between p-5 rounded-[24px] bg-vault-card/40 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">AWS Infrastructure</p>
                    <p className="text-[11px] text-gray-500">Cloud Hosting • May 02</p>
                  </div>
                  <p className="text-sm font-bold text-red-400">-$1,240</p>
                </div>
                <div className="flex items-center justify-between p-5 rounded-[24px] bg-vault-card/40 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Office Supplies</p>
                    <p className="text-[11px] text-gray-500">Equipment • Apr 28</p>
                  </div>
                  <p className="text-sm font-bold text-red-400">-$320</p>
                </div>
              </>
            )}
            {activeTab === 'invoices' && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No pending invoices</p>
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No documents uploaded</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
