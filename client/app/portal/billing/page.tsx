'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Repeat, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function PortalBillingPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await api.get('/api/financial/subscriptions/client');
        setSubscriptions(res.data.data.subscriptions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Billing & Subscriptions</h1>
        <p className="text-gray-400">Manage your active plans and billing methods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subscriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Repeat size={20} className="text-vault-green" /> Active Plans
          </h2>
          
          {loading ? (
            <div className="text-gray-500 animate-pulse">Loading plans...</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-black/20 border border-white/5 rounded-2xl p-8 text-center text-gray-500">
              No active subscriptions.
            </div>
          ) : (
            subscriptions.map(sub => (
              <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/[0.07]">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {sub.planName}
                    <span className="text-[10px] bg-vault-green/10 text-vault-green px-2 py-0.5 rounded uppercase tracking-wider font-bold">Active</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Next invoice processing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="font-mono font-bold text-xl text-white">${parseFloat(sub.amount).toFixed(2)}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">{sub.interval}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-400" /> Payment Methods
          </h2>
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={48}/></div>
            <div className="mb-8">
              <div className="w-10 h-6 bg-white/20 rounded mb-2"></div>
              <div className="font-mono text-lg tracking-widest text-white">•••• •••• •••• 4242</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Default Auto-Pay</div>
                <div className="text-sm font-bold text-white mt-0.5">Expires 12/28</div>
              </div>
              <CheckCircle2 size={20} className="text-vault-green" />
            </div>
          </div>
          
          <button className="w-full border border-white/10 hover:border-white/30 hover:bg-white/5 text-sm font-bold text-white py-3 rounded-xl transition-colors">
            + Add Payment Method
          </button>
        </div>

      </div>
    </div>
  );
}
