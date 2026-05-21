'use client';

import { useState, useEffect } from 'react';
import { Repeat, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface Subscription {
  id: string;
  planName: string;
  status: string;
  amount: number;
  interval: string;
  nextBillingDate: string;
}

export default function ClientSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSubscriptions([
        { id: '1', planName: 'Enterprise Retainer', status: 'ACTIVE', amount: 2500.00, interval: 'MONTHLY', nextBillingDate: '2026-06-01T00:00:00Z' },
        { id: '2', planName: 'Property Maintenance Plan', status: 'ACTIVE', amount: 350.00, interval: 'MONTHLY', nextBillingDate: '2026-06-01T00:00:00Z' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Repeat className="text-[var(--brand-primary,#2563EB)]" /> Active Subscriptions
        </h1>
        <p className="text-gray-500 mt-2">Manage your recurring retainers and service plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-400 p-4">Loading subscriptions...</p>
        ) : subscriptions.map(sub => (
          <div key={sub.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}
            />
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600" style={{ backgroundColor: 'var(--brand-primary)', opacity: 0.1, color: 'var(--brand-primary)' }}>
                <ShieldCheck size={24} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                {sub.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{sub.planName}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold text-gray-900">${sub.amount.toFixed(0)}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/{sub.interval.toLowerCase()}</span>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="text-gray-500">Next Billing</span>
                <span className="font-bold text-gray-900">{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-bold text-gray-900 flex items-center gap-1"><CreditCard size={14}/> •••• 4242</span>
              </div>
            </div>

            <button className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2">
              Manage Billing <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
