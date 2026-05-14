'use client';

import { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowRightLeft, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Download,
  Landmark,
  CreditCard,
  Smartphone,
  Banknote,
  MoreVertical,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Area, 
  AreaChart 
} from 'recharts';

interface Wallet {
  _id: string;
  accountName: string;
  accountType: string;
  bankName: string;
  maskedAccountNumber: string;
  balance: number;
  currency: string;
  transactions: any[];
}

interface DesktopWalletLayoutProps {
  wallets: Wallet[];
  summary: { totalBalance: number };
  onAddWallet: () => void;
  onAddTransaction: () => void;
  onGenerateStatement: () => void;
}

export function DesktopWalletLayout({
  wallets,
  summary,
  onAddWallet,
  onAddTransaction,
  onGenerateStatement
}: DesktopWalletLayoutProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedWallet = wallets.find(w => w._id === selectedWalletId) || (wallets.length > 0 ? wallets[0] : null);
  
  const allTransactions = wallets.flatMap(w => 
    w.transactions.map(t => ({ ...t, accountName: w.accountName, walletId: w._id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedTransactions = selectedWalletId 
    ? allTransactions.filter(t => t.walletId === selectedWalletId)
    : allTransactions;

  const filteredTransactions = displayedTransactions.filter(t => 
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics data
  const pieData = wallets.map(w => ({ name: w.accountName, value: w.balance }));
  const COLORS = ['#00FF88', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444'];

  const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex gap-6 min-h-[calc(100vh-140px)]">
      
      {/* LEFT: Wallet List (350px) */}
      <div className="w-[350px] space-y-6 flex-shrink-0">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Wallet className="text-vault-green" size={20} />
              Accounts
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAddWallet}
              className="w-8 h-8 rounded-full bg-vault-green/10 border border-vault-green/20 flex items-center justify-center text-vault-green"
            >
              <Plus size={16} strokeWidth={3} />
            </motion.button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {wallets.map(wallet => (
              <button
                key={wallet._id}
                onClick={() => setSelectedWalletId(wallet._id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedWallet?._id === wallet._id 
                    ? 'bg-vault-green/10 border-vault-green/30' 
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{wallet.accountType.replace('_', ' ')}</span>
                  <span className="text-white font-bold">{fmt(wallet.balance)}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{wallet.accountName}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{wallet.bankName} · {wallet.maskedAccountNumber}</p>
              </button>
            ))}
            {wallets.length === 0 && (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 text-xs">No accounts linked</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Distribution Chart */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-sm">
          <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
            <PieChartIcon size={16} className="text-purple-400" />
            Distribution
          </h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT: Transactions & Overview */}
      <div className="flex-1 space-y-6">
        
        {/* Top Overview Bar */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-vault-green/5 blur-3xl group-hover:bg-vault-green/10 transition-all" />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Liquidity</p>
            <h2 className="text-3xl font-display font-bold text-white">{fmt(summary.totalBalance)}</h2>
            <div className="mt-4 flex items-center gap-2 text-vault-green text-xs font-bold">
              <TrendingUp size={14} />
              <span>+2.4% this month</span>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden group">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Current Account</p>
            <h2 className="text-3xl font-display font-bold text-white">
              {selectedWallet ? fmt(selectedWallet.balance) : '---'}
            </h2>
            <p className="mt-4 text-gray-500 text-xs font-medium">
              {selectedWallet ? selectedWallet.accountName : 'Select an account'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAddTransaction}
              className="flex-1 h-full bg-blue-500 hover:bg-blue-400 text-white rounded-3xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <ArrowRightLeft size={24} />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={onGenerateStatement}
              className="w-24 h-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] rounded-3xl flex flex-col items-center justify-center gap-2 text-gray-400 transition-all group"
            >
              <FileText size={20} className="group-hover:text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Statement</span>
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-bold">Transaction History</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-vault-green/50 w-[240px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 text-xs font-bold flex items-center gap-2 hover:text-white transition-all">
                <Filter size={12} />
                Filter
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Note</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTransactions.map((tx, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-6 text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-sm font-bold text-white">{tx.accountName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 truncate max-w-[200px]">{tx.note || '-'}</td>
                      <td className={`py-4 px-6 text-sm font-bold text-right ${tx.type === 'income' ? 'text-vault-green' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-500 text-sm">
                      No transactions found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
