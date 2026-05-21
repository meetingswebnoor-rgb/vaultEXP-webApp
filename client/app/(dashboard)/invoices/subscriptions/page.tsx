'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Repeat, Plus, PlayCircle, Ban, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ planName: '', amount: 0, interval: 'MONTHLY' });

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/api/financial/subscriptions');
      setSubscriptions(res.data.data.subscriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/financial/subscriptions', formData);
      setShowModal(false);
      setFormData({ planName: '', amount: 0, interval: 'MONTHLY' });
      await fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRenewals = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/api/financial/subscriptions/process-renewals');
      alert(`Cron triggered manually: ${res.data.message}`);
      await fetchSubscriptions();
    } catch (err) {
      console.error(err);
      alert('Failed to process renewals.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await api.post(`/api/financial/subscriptions/${id}/cancel`);
      await fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Subscriptions Engine" 
          description="Manage recurring billing logic and auto-invoicing cycles." 
        />
        <div className="flex gap-4">
          <button 
            onClick={handleProcessRenewals}
            disabled={processing}
            className="flex items-center gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50"
          >
            {processing ? <Clock className="animate-spin" size={16} /> : <PlayCircle size={16} />} 
            Force Run Engine
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map(sub => {
          const isDue = new Date(sub.nextBillingDate) <= new Date();
          return (
            <div key={sub.id} className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-indigo-400">
                    <Repeat size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{sub.planName}</h3>
                    <div className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase w-fit mt-1", sub.status === 'ACTIVE' ? "bg-vault-green/10 text-vault-green" : "bg-red-500/10 text-red-400")}>
                      {sub.status}
                    </div>
                  </div>
                </div>
                {sub.status === 'ACTIVE' && (
                  <button onClick={() => handleCancel(sub.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Ban size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Billing Amount</div>
                  <div className="font-mono font-bold text-lg text-white">${parseFloat(sub.amount).toFixed(2)}</div>
                  <div className="text-xs text-gray-400">{sub.interval}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Next Invoice Due</div>
                  <div className={cn("font-bold text-sm", isDue && sub.status === 'ACTIVE' ? "text-amber-400" : "text-white")}>
                    {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </div>
                  {isDue && sub.status === 'ACTIVE' && <div className="text-[10px] text-amber-400/80 mt-0.5 uppercase tracking-wider">Due for engine cycle</div>}
                </div>
              </div>
            </div>
          );
        })}
        {subscriptions.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 font-bold">No subscriptions configured.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-vault-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6">Create Subscription Plan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plan Name</label>
                <input required type="text" value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount</label>
                  <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Interval</label>
                  <select value={formData.interval} onChange={e => setFormData({...formData, interval: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none">
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-vault-green hover:bg-vault-green/90 text-black font-bold py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">Create Plan</button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
