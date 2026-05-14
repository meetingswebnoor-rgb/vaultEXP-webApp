'use client';

import { X, Download, FileText, Landmark, Calendar, ArrowUpRight, ArrowDownLeft, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface Transaction {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  note?: string;
  date: string;
}

interface Wallet {
  _id: string;
  accountName: string;
  accountType: string;
  bankName: string;
  maskedAccountNumber: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

interface GenerateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
}

export function GenerateStatementModal({ isOpen, onClose, wallets }: GenerateStatementModalProps) {
  const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Account', 'Type', 'Category', 'Amount', 'Note'];
    const rows = wallets.flatMap(w => 
      w.transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        w.accountName,
        t.type,
        t.category,
        t.amount,
        t.note || ''
      ])
    );

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `VaultEXP_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col h-[85vh]">
        {/* Header - Non-Printable */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white leading-tight">Financial Statement</h3>
              <p className="text-xs text-gray-500 mt-0.5">Summary of your accounts and activities.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-vault-green text-black font-bold text-xs flex items-center gap-2"
            >
              <Printer size={14} />
              Print PDF
            </button>
          </div>
        </div>

        {/* Content - Printable Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-black print:bg-white print:text-black custom-scrollbar" id="statement-content">
          <div className="max-w-3xl mx-auto space-y-10">
            
            {/* Brand/Header */}
            <div className="flex justify-between items-start border-b-2 border-vault-green pb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-vault-green print:text-black">VAULT<span className="text-white print:text-black">EXP</span></h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Secure Asset Ledger</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-white print:text-black">ACCOUNT STATEMENT</h2>
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-2">
                  <Calendar size={12} />
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Account Summaries */}
            <div className="grid grid-cols-2 gap-6">
              {wallets.map(wallet => (
                <div key={wallet._id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] print:border-black/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 print:text-black">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white print:text-black">{wallet.accountName}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{wallet.bankName} · {wallet.maskedAccountNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Balance</span>
                    <span className="text-lg font-bold text-vault-green print:text-black">{fmt(wallet.balance)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Combined Transaction Ledger */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-[0.2em] border-b border-white/10 pb-2">Transaction History</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-widest print:text-black print:border-black/20">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Account</th>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.flatMap(w => w.transactions.map(t => ({...t, acc: w.accountName}))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, i) => (
                    <tr key={i} className="border-b border-white/[0.03] print:border-black/5">
                      <td className="py-3 px-2 text-xs text-gray-400 print:text-black">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-xs font-bold text-white print:text-black">{tx.acc}</td>
                      <td className="py-3 px-2">
                        <p className="text-xs text-white print:text-black font-medium">{tx.category}</p>
                        <p className="text-[10px] text-gray-500 print:text-black/60 truncate max-w-[200px]">{tx.note || '-'}</p>
                      </td>
                      <td className={`py-3 px-2 text-xs font-bold text-right ${tx.type === 'income' ? 'text-vault-green' : 'text-red-400'} print:text-black`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="pt-10 border-t-2 border-vault-green mt-10 print:border-black">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Inbound</p>
                  <p className="text-xl font-bold text-vault-green print:text-black flex items-center justify-center gap-2">
                    <ArrowUpRight size={16} />
                    {fmt(wallets.reduce((acc, w) => acc + w.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), 0))}
                  </p>
                </div>
                <div className="text-center border-x border-white/10 print:border-black/10">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Outbound</p>
                  <p className="text-xl font-bold text-red-400 print:text-black flex items-center justify-center gap-2">
                    <ArrowDownLeft size={16} />
                    {fmt(wallets.reduce((acc, w) => acc + w.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Net Liquidity</p>
                  <p className="text-xl font-bold text-white print:text-black">
                    {fmt(wallets.reduce((acc, w) => acc + w.balance, 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-20 text-center pb-10">
              <p className="text-[10px] text-gray-600 print:text-black italic">This is a system-generated statement from VaultEXP. Please reconcile with your primary bank records.</p>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
