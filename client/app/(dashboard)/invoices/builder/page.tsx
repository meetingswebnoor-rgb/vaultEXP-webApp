'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvoiceBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    discountAmount: 0,
    dueDate: '',
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
  ]);

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculateTax = () => items.reduce((acc, item) => acc + ((item.quantity * item.unitPrice) * (item.taxRate / 100)), 0);
  const calculateTotal = () => calculateSubtotal() + calculateTax() - formData.discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/financial/invoices', {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        items
      });
      router.push('/invoices');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Invoice Builder" description="Create a branded enterprise invoice." />

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4">Client Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Client Name</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Client Email</label>
                <input type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Billing Address</label>
                <input type="text" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Line Items</h3>
              <button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }])} className="text-xs font-bold text-vault-green flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input required placeholder="Description" type="text" value={item.description} onChange={e => { const newItems = [...items]; newItems[idx].description = e.target.value; setItems(newItems); }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none text-sm" />
                  </div>
                  <div className="w-24">
                    <input required type="number" min="1" value={item.quantity} onChange={e => { const newItems = [...items]; newItems[idx].quantity = parseFloat(e.target.value); setItems(newItems); }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none text-sm" />
                  </div>
                  <div className="w-32">
                    <input required placeholder="Price" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => { const newItems = [...items]; newItems[idx].unitPrice = parseFloat(e.target.value); setItems(newItems); }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none text-sm" />
                  </div>
                  <div className="w-24">
                    <input required placeholder="Tax %" type="number" min="0" max="100" value={item.taxRate} onChange={e => { const newItems = [...items]; newItems[idx].taxRate = parseFloat(e.target.value); setItems(newItems); }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-vault-green outline-none text-sm" />
                  </div>
                  <button type="button" onClick={() => { if(items.length > 1) setItems(items.filter((_, i) => i !== idx)) }} className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl mt-0.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
            <h3 className="font-bold text-white mb-4">Invoice Summary</h3>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tax</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 items-center">
                <span>Discount</span>
                <input type="number" min="0" step="0.01" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: parseFloat(e.target.value) || 0})} className="w-24 bg-black/40 border border-white/10 rounded-md px-2 py-1 text-white text-right outline-none" />
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg text-white mb-8">
              <span>Total</span>
              <span className="text-vault-green">${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 focus:border-vault-green outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-vault-green text-black font-bold py-3 rounded-xl hover:bg-vault-green/90 transition-colors">
              <Save size={18} /> Save as Draft
            </button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
