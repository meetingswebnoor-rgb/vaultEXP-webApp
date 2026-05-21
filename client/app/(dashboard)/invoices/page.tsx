'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  Receipt, Plus, Download, Send, CheckCircle, 
  Clock, AlertTriangle, Bot, MoreVertical, FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
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

  const downloadPDF = async (id: string, number: string) => {
    try {
      // Direct browser download approach
      window.open(`http://localhost:5000/api/financial/invoices/${id}/pdf`, '_blank');
    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  };

  const markStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/financial/invoices/${id}/status`, { status });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvoice = async (id: string) => {
    try {
      await api.post(`/api/financial/invoices/${id}/send`);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-vault-green bg-vault-green/10 border border-vault-green/20">PAID</span>;
      case 'draft': return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-gray-400 bg-gray-500/10 border border-gray-500/20">DRAFT</span>;
      case 'sent': return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20">SENT</span>;
      case 'overdue': return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20">OVERDUE</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-gray-400 bg-gray-500/10">{status.toUpperCase()}</span>;
    }
  };

  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Invoices" 
          description="Enterprise billing, automated tracking, and premium PDFs." 
        />
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Bot size={16} /> Auto-Detect Overdue
          </button>
          <Link 
            href="/invoices/builder"
            className="flex items-center gap-2 bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Plus size={16} /> Create Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl flex items-center justify-between group">
          <div>
            <div className="text-gray-400 text-sm font-bold mb-1">Total Outstanding</div>
            <div className="text-3xl font-display font-bold text-white">${totalOutstanding.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl flex items-center justify-between group">
          <div>
            <div className="text-gray-400 text-sm font-bold mb-1">Overdue Invoices</div>
            <div className="text-3xl font-display font-bold text-red-400">{overdueCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
        </div>

        <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl flex items-center justify-between group">
          <div>
            <div className="text-gray-400 text-sm font-bold mb-1">Total Paid (All Time)</div>
            <div className="text-3xl font-display font-bold text-vault-green">
              ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0).toFixed(2)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-vault-green/10 border border-vault-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle size={24} className="text-vault-green" />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <FileText size={18} className="text-indigo-400" /> Recent Invoices
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Issued</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No invoices generated yet.</p>
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-sm text-gray-200">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500">{inv.items?.length || 0} items</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{inv.clientName}</div>
                    <div className="text-xs text-gray-500">{inv.clientEmail}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">
                    ${parseFloat(inv.totalAmount).toFixed(2)}
                  </td>
                  <td className="p-4">{getStatusBadge(inv.status)}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(inv.issueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status === 'draft' && (
                        <button 
                          onClick={() => sendInvoice(inv.id)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                          title="Send to Client"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {inv.status !== 'paid' && (
                        <button 
                          onClick={() => markStatus(inv.id, 'paid')}
                          className="p-2 bg-vault-green/10 text-vault-green rounded-lg hover:bg-vault-green/20"
                          title="Mark Paid"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => downloadPDF(inv.id, inv.invoiceNumber)}
                        className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
