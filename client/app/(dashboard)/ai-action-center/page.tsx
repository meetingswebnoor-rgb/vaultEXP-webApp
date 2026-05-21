'use client';

import React from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { AIActionCenter } from '@/components/ai/AIActionCenter';
import { Sparkles, Terminal } from 'lucide-react';

export default function AIActionCenterPage() {
  return (
    <PageContainer>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <PageHeader
          title="Action Center"
          description="Central AI automation hub. Instantly execute strategically aggregated property, tax, and ledger tasks."
        />
        <div className="flex items-center gap-2 bg-vault-green/10 border border-vault-green/20 px-3 py-1.5 rounded-full text-vault-green text-[10px] font-bold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" /> AI Engine Active
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Primary AI Automation Suggestions Card */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-vault-green" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active AI Tasks</h3>
          </div>
          <AIActionCenter />
        </div>

      </div>

    </PageContainer>
  );
}
