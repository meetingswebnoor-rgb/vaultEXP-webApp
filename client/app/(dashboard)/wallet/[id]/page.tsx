'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Loader2, 
  ChevronLeft, 
  Settings, 
  Trash2, 
  Plus, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  Briefcase,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useToast } from '@/components/ui/Toast';
import { EditWalletModal } from '@/components/wallet/EditWalletModal';
import { AddTransactionModal } from '@/components/wallet/AddTransactionModal';

export default function WalletDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: wallet, isLoading, isError } = useQuery({
    queryKey: ['wallet', id],
    queryFn: async () => {
      const res = await api.get(`/wallet/${id}`);
      return res.data.data;
    }
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this account? All transaction history will be lost.')) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/wallet/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['wallets'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-analytics'] });
      showToast('Account deleted successfully', 'success');
      router.push('/wallet');
    } catch (err) {
      showToast('Failed to delete account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-vault-green" size={32} />
      </div>
    </PageContainer>
  );

  if (isError || !wallet) return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white">Account Not Found</h2>
        <button onClick={() => router.push('/wallet')} className="mt-4 text-vault-green font-bold">Return to Wallets</button>
      </div>
    </PageContainer>
  );

  const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Category distribution for analytics
  const categoriesMap = wallet.transactions.reduce((acc: any, tx: any) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
  const pieData = Object.keys(categoriesMap).map(name => ({ name, value: categoriesMap[name] }));
  const COLORS = ['#00FF88', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444'];

  return (
    <PageContainer>
      <EditWalletModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} wallet={wallet} />
      <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} wallets={[wallet]} />

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{wallet.accountName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-0.5 bg-white/[0.05] border border-white/10 rounded-md">
                {wallet.accountType.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{wallet.bankName} · {wallet.maskedAccountNumber}</span>
              
              {/* Linked Entities */}
              {wallet.linkedBusinessId && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  <Briefcase size={10} />
                  {wallet.linkedBusinessId.name}
                </div>
              )}
              {wallet.linkedPropertyId && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  <Home size={10} />
                  {wallet.linkedPropertyId.name}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-2"
          >
            <Settings size={14} />
            Edit
          </button>
          <button 
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold flex items-center gap-2"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Delete
          </button>
          <button 
            onClick={() => setIsTxModalOpen(true)}
            className="px-6 py-2 rounded-xl bg-vault-green text-black font-bold text-xs shadow-lg shadow-vault-green/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={14} strokeWidth={3} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Stats Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
              <h2 className="text-3xl font-display font-bold text-white">{fmt(wallet.balance)}</h2>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Inbound</p>
              <h2 className="text-3xl font-display font-bold text-vault-green">
                {fmt(wallet.transactions.filter((t:any) => t.type === 'income').reduce((s:any,t:any)=>s+t.amount, 0))}
              </h2>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Outbound</p>
              <h2 className="text-3xl font-display font-bold text-red-400">
                {fmt(wallet.transactions.filter((t:any) => t.type === 'expense').reduce((s:any,t:any)=>s+t.amount, 0))}
              </h2>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Activity size={18} className="text-vault-green" />
                Ledger History
              </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Note</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                      <td className="py-4 px-6 text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 truncate max-w-[200px]">{tx.note || '-'}</td>
                      <td className={`py-4 px-6 text-sm font-bold text-right ${tx.type === 'income' ? 'text-vault-green' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {wallet.transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-600 text-sm italic">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
            <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" />
              Category Mix
            </h3>
            <div className="h-[250px]">
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
            <div className="mt-6 space-y-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                  <span className="text-white">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-vault-green/5 border border-vault-green/10 rounded-3xl p-6">
            <h3 className="text-vault-green font-bold text-sm mb-2 flex items-center gap-2">
              <Activity size={16} />
              Vault Health
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This account is currently active and healthy. Liquidity ratios are stable based on your historical spending patterns.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
