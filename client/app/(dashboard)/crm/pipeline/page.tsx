'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
import { usePipelines, useDeals, useCreateDeal } from '@/features/crm/useCrm';
import { DealCard } from '@/features/crm/DealCard';

export default function PipelinePage() {
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const createDeal = useCreateDeal();
  const [isAddingDeal, setIsAddingDeal] = useState<string | null>(null);

  if (pipelinesLoading || dealsLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl w-full" />;
  }

  // Use the first pipeline by default
  const pipeline = pipelines?.[0];

  if (!pipeline) {
    return (
      <div className="text-center p-12 bg-vault-card border border-white/5 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-2">No Pipeline Found</h3>
        <p className="text-gray-400 mb-6">Create a pipeline to start tracking deals.</p>
        <button className="px-6 py-2 rounded-xl bg-vault-green text-black font-bold hover:bg-vault-green/90 transition-all">
          Create Pipeline
        </button>
      </div>
    );
  }

  const handleQuickAdd = (stageId: string) => {
    // Basic mock creation. A real app would open a modal with a form.
    createDeal.mutate({
      title: 'New Opportunity',
      value: 10000,
      stageId,
      contactId: undefined // Would be selected in a form
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{pipeline.name}</h2>
        <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all">
          Create Deal
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {pipeline.stages.map((stage: any) => {
          const stageDeals = deals?.filter((d: any) => d.stageId === stage.id) || [];
          const totalValue = stageDeals.reduce((sum: number, deal: any) => sum + Number(deal.value), 0);

          return (
            <div key={stage.id} className="w-[300px] flex-shrink-0 flex flex-col bg-vault-card/50 rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-vault-darker/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color || '#3B82F6' }} />
                    {stage.name}
                  </h3>
                  <button className="text-gray-500 hover:text-white">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{stageDeals.length} Deals</span>
                  <span className="font-semibold text-vault-green">${totalValue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {stageDeals.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>

              <div className="p-3 border-t border-white/5">
                <button 
                  onClick={() => setIsAddingDeal(stage.id)}
                  className="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold"
                >
                  <Plus size={16} /> Add Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
