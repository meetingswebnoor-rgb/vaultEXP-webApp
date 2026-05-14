'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { rentApi, RentRecord } from '@/features/property/rentApi';
import { cn } from '@/lib/utils/cn';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

export function RentManager({ propertyId }: { propertyId: string }) {
  const qc = useQueryClient();
  
  // Default to current month YYYY-MM
  const d = new Date();
  const [currentMonth, setCurrentMonth] = useState<string>(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  );

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['rent', propertyId, currentMonth],
    queryFn: () => rentApi.list(propertyId, currentMonth),
  });

  const generateBulk = useMutation({
    mutationFn: () => rentApi.generateBulk(propertyId, currentMonth),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rent', propertyId, currentMonth] }),
  });

  const updateRent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RentRecord> }) => rentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rent', propertyId, currentMonth] });
      // Might want to invalidate property summary if we track paid rent there eventually
    },
  });

  const shiftMonth = (offset: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleMarkPaid = (record: RentRecord) => {
    updateRent.mutate({ id: record._id, data: { amountPaid: record.amountExpected } });
  };

  const expectedTotal = records.reduce((s, r) => s + r.amountExpected, 0);
  const paidTotal = records.reduce((s, r) => s + r.amountPaid, 0);
  const isComplete = expectedTotal > 0 && paidTotal >= expectedTotal;

  const [showLedger, setShowLedger] = useState(false);

  const handleGenerateLedger = () => {
    const pending = expectedTotal - paidTotal;
    const summary = {
      totalRent: expectedTotal,
      paid: paidTotal,
      pending: pending > 0 ? pending : 0
    };

    setShowLedger(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        
        {/* Month Selector */}
        <div className="flex items-center gap-4 bg-vault-dark/50 border border-white/[0.1] rounded-xl p-1">
          <button onClick={() => shiftMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="w-24 text-center text-[14px] font-bold tracking-widest uppercase">
            {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <button onClick={() => shiftMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Collected</p>
            <p className={cn("text-[16px] font-bold font-display", isComplete ? "text-vault-green" : "text-white")}>
              {fmt(paidTotal)} <span className="text-gray-600 text-[13px]">/ {fmt(expectedTotal)}</span>
            </p>
          </div>
          
          <button 
            onClick={handleGenerateLedger}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white text-[12px] font-semibold transition-all"
          >
            <FileText size={14} />
            Generate Ledger
          </button>
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-vault-green/20 border-t-vault-green rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/[0.07] rounded-2xl flex flex-col items-center">
          <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4 text-gray-500"><DollarSign size={20} /></div>
          <p className="text-[14px] text-gray-400 mb-2">No rent records for this month.</p>
          <button 
            onClick={() => {

              generateBulk.mutate();
            }}
            disabled={generateBulk.isPending}
            className="text-[12px] text-vault-green font-semibold hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {generateBulk.isPending && <RefreshCw size={12} className="animate-spin" />}
            Generate records from active tenants
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                {['Tenant', 'Expected', 'Paid', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {records.map(r => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[13px] font-semibold text-white">{(r.tenantId as any)?.name ?? 'Unknown Tenant'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] text-gray-300">{fmt(r.amountExpected)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={cn("text-[13px] font-bold", r.amountPaid >= r.amountExpected ? "text-vault-green" : "text-amber-400")}>
                      {fmt(r.amountPaid)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                      r.status === 'paid' ? 'bg-vault-green/10 text-vault-green' : 
                      r.status === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                      r.status === 'overdue' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-gray-400'
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {r.status !== 'paid' && (
                      <button 
                        onClick={() => handleMarkPaid(r)}
                        disabled={updateRent.isPending}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-vault-green/10 text-vault-green hover:bg-vault-green/20 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Ledger Modal ─────────────────────────────────────── */}
      {showLedger && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            onClick={() => setShowLedger(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-vault-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Ledger Summary</h3>
                <p className="text-xs text-gray-400">{new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[13px] font-semibold text-gray-400">Total Expected</span>
                <span className="text-[15px] text-white font-bold">{fmt(expectedTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-vault-green/5 border border-vault-green/10">
                <span className="text-[13px] font-semibold text-gray-400">Total Paid</span>
                <span className="text-[15px] text-vault-green font-bold">{fmt(paidTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[13px] font-semibold text-gray-400">Pending Amount</span>
                <span className="text-[15px] text-amber-400 font-bold">{fmt(Math.max(expectedTotal - paidTotal, 0))}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowLedger(false)}
              className="w-full py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] font-semibold text-[13px] text-white rounded-xl transition-all"
            >
              Close Ledger
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
