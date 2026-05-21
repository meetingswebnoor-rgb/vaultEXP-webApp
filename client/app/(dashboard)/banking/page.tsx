'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { Landmark, Link as LinkIcon, RefreshCw, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function BankingPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/api/wallet');
      setWallets(res.data.data.wallets);
      if (res.data.data.wallets.length > 0 && !activeWalletId) {
        setActiveWalletId(res.data.data.wallets[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleConnectBank = async () => {
    setConnecting(true);
    try {
      // Simulate Plaid Link success
      await api.post('/api/financial/banking/connect', {
        publicToken: 'public-mock-token'
      });
      await fetchWallets();
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const loadReconciliation = async (walletId: string) => {
    setActiveWalletId(walletId);
    try {
      const res = await api.get(`/api/financial/banking/${walletId}/reconciliation`);
      setReconciliation(res.data.data.report);
    } catch (err) {
      console.error(err);
    }
  };

  const autoReconcile = async () => {
    if (!activeWalletId) return;
    try {
      await api.post(`/api/financial/banking/${activeWalletId}/reconcile`);
      await loadReconciliation(activeWalletId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeWalletId) {
      loadReconciliation(activeWalletId);
    }
  }, [activeWalletId]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <PageHeader 
          title="Banking & Treasury" 
          description="Manage connected bank accounts and reconcile internal ledgers." 
        />
        <button 
          onClick={handleConnectBank}
          disabled={connecting}
          className="flex items-center gap-2 bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50"
        >
          {connecting ? <RefreshCw className="animate-spin" size={16} /> : <LinkIcon size={16} />} 
          Connect External Bank
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Connected Accounts List */}
        <div className="space-y-4">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Landmark size={18} className="text-indigo-400" /> Connected Accounts
          </h2>
          
          {wallets.length === 0 && !loading && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-8 text-center text-gray-500 shadow-xl">
              <Landmark size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold">No accounts connected.</p>
            </div>
          )}

          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              onClick={() => loadReconciliation(wallet.id)}
              className={cn(
                "bg-vault-card border rounded-2xl p-5 shadow-xl cursor-pointer transition-all group",
                activeWalletId === wallet.id ? "border-vault-green bg-vault-green/5" : "border-white/5 hover:border-white/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-white">{wallet.bankName || 'Vault Core Wallet'}</div>
                <ChevronRight size={16} className={cn("transition-transform", activeWalletId === wallet.id ? "text-vault-green translate-x-1" : "text-gray-600 group-hover:translate-x-1")} />
              </div>
              <div className="text-sm font-mono text-gray-400 mb-4">{wallet.accountNumber || '****Core'}</div>
              <div className="text-2xl font-display font-bold text-white">
                ${parseFloat(wallet.balance).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Reconciliation Center */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-white mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-400" /> Reconciliation Center
            </div>
            {reconciliation && reconciliation.status !== 'RECONCILED' && (
              <button 
                onClick={autoReconcile}
                className="text-xs font-bold bg-blue-500 hover:bg-blue-400 text-black px-3 py-1.5 rounded-lg transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              >
                Auto-Reconcile Matches
              </button>
            )}
          </h2>

          {!activeWalletId && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-12 text-center text-gray-500 shadow-xl">
              <p className="font-bold">Select an account to view reconciliation status.</p>
            </div>
          )}

          {reconciliation && (
            <div className="bg-vault-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Status</div>
                  <div className={cn("font-bold text-sm flex items-center justify-center gap-2", reconciliation.status === 'RECONCILED' ? "text-vault-green" : "text-amber-400")}>
                    {reconciliation.status === 'RECONCILED' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    {reconciliation.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Matched</div>
                  <div className="font-bold text-lg text-white">{reconciliation.summary.totalMatched}</div>
                </div>
                <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Unmatched</div>
                  <div className="font-bold text-lg text-red-400">{reconciliation.summary.totalInternalUnmatched + reconciliation.summary.totalExternalUnmatched}</div>
                </div>
              </div>

              {/* Matched Preview */}
              {reconciliation.matched.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Recently Matched</h3>
                  <div className="space-y-2">
                    {reconciliation.matched.slice(0, 3).map((match: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-vault-green/5 border border-vault-green/10 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={14} className="text-vault-green" />
                          <span className="text-sm text-gray-300">{match.internal.description || match.external.name}</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-white">${Math.abs(parseFloat(match.external.amount)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discrepancies */}
              {(reconciliation.internalUnmatched.length > 0 || reconciliation.externalUnmatched.length > 0) && (
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                    <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={14} /> Vault Ledger (Orphaned)
                    </h3>
                    <div className="space-y-2">
                      {reconciliation.internalUnmatched.map((tx: any) => (
                        <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                          <span className="text-xs text-gray-400 line-clamp-1">{tx.description}</span>
                          <span className="text-xs font-bold font-mono text-white">${parseFloat(tx.amount).toFixed(2)}</span>
                        </div>
                      ))}
                      {reconciliation.internalUnmatched.length === 0 && <p className="text-xs text-gray-600">No orphaned records.</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={14} /> Bank Feed (Missing from Vault)
                    </h3>
                    <div className="space-y-2">
                      {reconciliation.externalUnmatched.map((tx: any) => (
                        <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                          <span className="text-xs text-gray-400 line-clamp-1">{tx.name}</span>
                          <span className="text-xs font-bold font-mono text-white">${Math.abs(parseFloat(tx.amount)).toFixed(2)}</span>
                        </div>
                      ))}
                      {reconciliation.externalUnmatched.length === 0 && <p className="text-xs text-gray-600">No missing records.</p>}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
