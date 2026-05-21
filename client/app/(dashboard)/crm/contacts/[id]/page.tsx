'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { useContacts } from '@/features/crm/useCrm';
import { ActivityTimeline } from '@/features/crm/ActivityTimeline';
import { DealCard } from '@/features/crm/DealCard';

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { data: contacts, isLoading } = useContacts();
  
  if (isLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl w-full" />;
  }

  const contact = contacts?.find((c: any) => c.id === params.id);

  if (!contact) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-bold text-white mb-2">Contact Not Found</h3>
        <p className="text-gray-400">The requested contact does not exist or you do not have permission.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Info & AI Insights */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-vault-card border border-white/5 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-vault-green/20 border-2 border-vault-green/40 flex items-center justify-center text-vault-green text-3xl font-display font-bold mb-4">
            {contact.name[0]}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{contact.name}</h2>
          <p className="text-gray-400 flex items-center gap-2 text-sm">
            <Building size={14} /> {contact.company || 'Independent'}
          </p>

          <div className="mt-6 space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-2 rounded-lg bg-white/5"><Mail size={16} /></div>
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-2 rounded-lg bg-white/5"><Phone size={16} /></div>
                {contact.phone}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
            <button className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all">
              Message
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-vault-green text-black font-bold text-sm hover:bg-vault-green/90 transition-all">
              Schedule Follow-up
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-4">
            <Sparkles size={16} /> VaultAI Insights
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            &quot;{contact.aiSummary || 'AI is currently analyzing this profile. Once enough data is gathered (emails, deals, notes), intelligent follow-up suggestions will appear here.'}&quot;
          </p>
        </div>
      </div>

      {/* Right Column: Deals & Activity */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-2xl bg-vault-card border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Active Deals</h3>
            <button className="text-xs font-bold text-vault-green hover:underline">Create Deal</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contact.deals?.length > 0 ? (
              contact.deals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} />
              ))
            ) : (
              <p className="text-sm text-gray-500 md:col-span-2">No active deals with this contact.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-vault-card border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
            <button className="text-xs font-bold text-vault-green hover:underline">Log Note</button>
          </div>
          
          <ActivityTimeline activities={contact.activities || []} />
        </div>
      </div>
    </div>
  );
}
