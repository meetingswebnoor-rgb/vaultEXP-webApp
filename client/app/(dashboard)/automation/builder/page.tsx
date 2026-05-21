'use client';
import { WorkflowBuilder } from '@/components/automation/WorkflowBuilder';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layouts/PageContainer';

export default function AutomationBuilderPage() {
  return (
    <PageContainer className="p-0">
      <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col bg-vault-darker overflow-hidden rounded-[32px] border border-white/[0.04]">
        
        {/* Builder Toolbar Header */}
        <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between bg-black/20 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-5">
            <Link href="/automation" className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-vault-green/10 border border-vault-green/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-vault-green" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-wide">Invoice Collection Sequence</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Editing Visual Automation</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Builder Canvas Area */}
        <div className="flex-1 relative bg-black/40 p-4">
          <WorkflowBuilder />
        </div>
        
      </div>
    </PageContainer>
  );
}
