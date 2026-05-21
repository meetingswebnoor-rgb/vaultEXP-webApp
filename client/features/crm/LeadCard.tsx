'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LeadCard({ contact }: { contact: any }) {
  const router = useRouter();
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/crm/contacts/${contact.id}`)}
      className="p-5 rounded-2xl bg-vault-card border border-white/[0.05] hover:border-vault-green/40 hover:shadow-xl cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{contact.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Building size={14} /> {contact.company || 'Unknown Company'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
          {contact.type}
        </span>
      </div>
      
      <div className="space-y-2 mt-4">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail size={14} className="text-gray-500" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone size={14} className="text-gray-500" />
            <span>{contact.phone}</span>
          </div>
        )}
      </div>
      
      {contact.aiSummary && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-400 italic line-clamp-2">"{contact.aiSummary}"</p>
        </div>
      )}
    </motion.div>
  );
}
