'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Receipt, Download, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SecureCheckoutButton } from '@/components/payments/SecureCheckoutButton';

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      // In a real app, this would fetch invoices specifically for the logged in client.
      // For demo, we just fetch the user's invoices.
      const res = await api.get('/api/financial/invoices');
      setInvoices(res.data.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const downloadPDF = (id: string) => {
    window.open(`http://localhost:5000/api/financial/invoices/${id}/pdf`, '_blank');
  };

  const handlePaymentSuccess = async (id: string) => {
    // In demo mode, we simulate the webhook by patching manually if we didn't receive the webhook
    try {
      await api.patch(`/api/financial/invoices/${id}/status`, { status: 'paid' });
      await fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Billing & Invoices" 
        description="View and pay your outstanding balances securely." 
      />

      <div className="mt-8 space-y-4">
        {invoices.length === 0 && !loading && (
          <div className="bg-vault-card border border-white/5 rounded-2xl p-12 text-center text-gray-500">
            <Receipt size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">You have no invoices at this time.</p>
          </div>
        )}

        {invoices.map((inv) => (
          <div key={inv.id} className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-white">{inv.invoiceNumber}</h3>
                {inv.status === 'paid' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-vault-green bg-vault-green/10 border border-vault-green/20">PAID</span>}
                {inv.status === 'overdue' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20">OVERDUE</span>}
              </div>
              <p className="text-sm text-gray-400">Issued: {new Date(inv.issueDate).toLocaleDateString()} {inv.dueDate && `• Due: ${new Date(inv.dueDate).toLocaleDateString()}`}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-display font-bold text-white mb-2">
                ${parseFloat(inv.totalAmount).toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadPDF(inv.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> PDF
                </button>
                {inv.status !== 'paid' && (
                  <SecureCheckoutButton 
                    invoiceId={inv.id}
                    amount={parseFloat(inv.totalAmount)}
                    currency={inv.currency}
                    onSuccess={() => handlePaymentSuccess(inv.id)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
