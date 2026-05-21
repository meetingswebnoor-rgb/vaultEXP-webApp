'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useContacts } from '@/features/crm/useCrm';
import { LeadCard } from '@/features/crm/LeadCard';

export default function ContactsPage() {
  const { data: contacts, isLoading } = useContacts();
  const [filter, setFilter] = useState('all'); // 'all', 'lead', 'client'
  
  if (isLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl w-full" />;
  }

  const filteredContacts = contacts?.filter((c: any) => filter === 'all' || c.type === filter) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full bg-vault-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-green/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-vault-card border border-white/10 rounded-xl overflow-hidden p-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('lead')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'lead' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Leads
            </button>
            <button 
              onClick={() => setFilter('client')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'client' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Clients
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vault-green text-black text-sm font-bold hover:bg-vault-green/90 transition-all shrink-0">
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact: any) => (
            <LeadCard key={contact.id} contact={contact} />
          ))
        ) : (
          <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-400">No contacts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
