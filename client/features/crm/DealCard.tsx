'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

export function DealCard({ deal }: { deal: any }) {
  return (
    <motion.div
      layoutId={deal.id}
      className="p-4 rounded-xl bg-white/[0.03] border border-white/10 shadow-lg cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-white leading-tight">{deal.title}</h4>
      </div>
      
      <p className="text-xs text-gray-400 mb-3 line-clamp-1">
        {deal.contact?.name} • {deal.contact?.company}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-vault-green font-bold">
          <DollarSign size={12} />
          {Number(deal.value).toLocaleString()}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-500">
            <TrendingUp size={12} /> {deal.probability}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
