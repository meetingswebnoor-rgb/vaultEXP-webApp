'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { useContacts, useDeals } from '@/features/crm/useCrm';
import Link from 'next/link';

export default function CRMDashboardPage() {
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: deals, isLoading: dealsLoading } = useDeals();

  if (contactsLoading || dealsLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl w-full" />;
  }

  const activeDeals = deals?.filter((d: any) => d.status === 'open') || [];
  const totalPipelineValue = activeDeals.reduce((sum: number, deal: any) => sum + Number(deal.value), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/5 rounded-full blur-[40px]" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-vault-green/10 rounded-xl text-vault-green border border-vault-green/20">
              <DollarSign size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-1">Total Pipeline Value</h3>
          <p className="text-3xl font-display font-bold text-white">
            ${totalPipelineValue.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-1">Total Contacts</h3>
          <p className="text-3xl font-display font-bold text-white">
            {contacts?.length || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-vault-card to-vault-darker border border-white/5 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px]" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Activity size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-1">Active Deals</h3>
          <p className="text-3xl font-display font-bold text-white">
            {activeDeals.length}
          </p>
        </motion.div>
      </div>

      {/* Recent Activity / Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl bg-vault-card border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Deals</h3>
            <Link href="/crm/pipeline" className="text-xs text-vault-green hover:underline flex items-center gap-1">
              View Pipeline <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {activeDeals.slice(0, 5).map((deal: any) => (
              <div key={deal.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <div>
                  <h4 className="text-sm font-bold text-white">{deal.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{deal.contact?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-vault-green">${Number(deal.value).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{deal.stage?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-vault-card border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Newest Contacts</h3>
            <Link href="/crm/contacts" className="text-xs text-vault-green hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {contacts?.slice(0, 5).map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <div className="w-10 h-10 rounded-full bg-vault-green/20 border border-vault-green/30 flex flex-shrink-0 items-center justify-center text-vault-green font-bold">
                  {contact.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                  <p className="text-xs text-gray-400">{contact.company || 'Lead'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
