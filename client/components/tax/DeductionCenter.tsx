'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, Sparkles, Filter, CheckCircle2,
  XCircle, ToggleLeft, ToggleRight, DollarSign, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';

interface Deduction {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  isTaxDeductible: boolean;
  taxCategory?: string;
}

interface Props {
  refreshTrigger?: number;
  onUpdated?: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function DeductionCenter({ refreshTrigger = 0, onUpdated }: Props) {
  const [claimed, setClaimed]     = useState<Deduction[]>([]);
  const [potential, setPotential] = useState<Deduction[]>([]);
  const [totals, setTotals]       = useState<any>({ claimed: 0, potential: 0, aggregate: 0 });
  const [loading, setLoading]     = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tax/deductions');
      const data = res.data?.data;
      if (data) {
        setClaimed(data.claimedDeductions || []);
        setPotential(data.potentialDeductions || []);
        setTotals(data.totals || { claimed: 0, potential: 0, aggregate: 0 });
      }
    } catch (e) {
      console.error('Failed to load deduction center', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, [refreshTrigger]);

  const toggleDeduction = async (expenseId: string, currentStatus: boolean, category: string) => {
    setUpdatingId(expenseId);
    try {
      await api.put(`/api/tax/deductions/${expenseId}`, {
        isDeductible: !currentStatus,
        taxCategory: category
      });
      await fetchDeductions();
      if (onUpdated) onUpdated();
    } catch (e) {
      console.error('Failed to toggle deduction status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 text-center space-y-2">
        <p className="text-zinc-500 text-xs">Loading deduction database records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Aggregates Summary */}
      <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-4">
        <div>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Write-offs Claimed</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-indigo-400 font-display">{fmt(totals.claimed)}</span>
            <span className="text-[9px] text-zinc-500">/ {claimed.length} items</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Unclaimed Opportunities</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-amber-400 font-display">{fmt(totals.potential)}</span>
            <span className="text-[9px] text-zinc-500">/ {potential.length} items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Claimed Write-offs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Deductions ({claimed.length})
          </h4>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[22px] p-3 max-h-[360px] overflow-y-auto space-y-2 pr-1.5">
            {claimed.map(item => (
              <div key={item.id} className="bg-black/30 border border-white/[0.04] rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white capitalize">{item.category.replace(/_/g, ' ')}</span>
                    <span className="text-[8px] text-gray-500 font-bold bg-white/[0.03] px-1.5 py-0.5 rounded">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">{item.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400">{fmt(item.amount)}</span>
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => toggleDeduction(item.id, item.isTaxDeductible, item.category)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ToggleRight className="w-7 h-7 text-indigo-500" />
                  </button>
                </div>
              </div>
            ))}
            {claimed.length === 0 && (
              <p className="text-center text-[10px] text-zinc-500 py-6">No deductions currently claimed.</p>
            )}
          </div>
        </div>

        {/* Right Column: Potential Write-offs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Potential Opportunities ({potential.length})
          </h4>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[22px] p-3 max-h-[360px] overflow-y-auto space-y-2 pr-1.5">
            {potential.map(item => (
              <div key={item.id} className="bg-black/30 border border-white/[0.04] rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white capitalize">{item.category.replace(/_/g, ' ')}</span>
                    <span className="text-[8px] text-gray-500 font-bold bg-white/[0.03] px-1.5 py-0.5 rounded">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">{item.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-300">{fmt(item.amount)}</span>
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => toggleDeduction(item.id, item.isTaxDeductible, item.category)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ToggleLeft className="w-7 h-7" />
                  </button>
                </div>
              </div>
            ))}
            {potential.length === 0 && (
              <p className="text-center text-[10px] text-zinc-500 py-6">All potential business write-offs audited.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
