'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, CreditCard, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  dueDate: string;
  createdAt: string;
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this fetches from /api/client/invoices
    setTimeout(() => {
      setInvoices([
        { id: '1', invoiceNumber: 'INV-2026-001', status: 'PENDING', totalAmount: 1250.00, dueDate: '2026-06-01T00:00:00Z', createdAt: '2026-05-15T00:00:00Z' },
        { id: '2', invoiceNumber: 'INV-2026-002', status: 'PAID', totalAmount: 850.00, dueDate: '2026-05-01T00:00:00Z', createdAt: '2026-04-15T00:00:00Z' },
        { id: '3', invoiceNumber: 'INV-2026-003', status: 'OVERDUE', totalAmount: 450.00, dueDate: '2026-04-01T00:00:00Z', createdAt: '2026-03-15T00:00:00Z' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 rounded-full"><CheckCircle2 size={12}/> Paid</span>;
      case 'PENDING': return <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1 rounded-full"><Clock size={12}/> Pending</span>;
      case 'OVERDUE': return <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 rounded-full"><AlertCircle size={12}/> Overdue</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="text-[var(--brand-primary,#2563EB)]" /> Financial Invoices
          </h1>
          <p className="text-gray-500 mt-2">View, download, and securely pay your outstanding invoices.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">$1,700.00</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading invoices...</td>
                </tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">Issued: {new Date(inv.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ${inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download size={18} />
                    </button>
                    {inv.status !== 'PAID' && (
                      <button 
                        className="flex items-center gap-2 px-4 py-2 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                        style={{ backgroundColor: 'var(--brand-primary, #2563EB)' }}
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
