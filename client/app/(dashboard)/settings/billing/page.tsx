'use client';

import { useCurrentSubscription, useCustomerPortal } from '@/hooks/useBilling';
import PlanComparison from '@/components/billing/PlanComparison';
import { CreditCard, History, Zap, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillingPage() {
  const { data: subData, isLoading } = useCurrentSubscription();
  const portal = useCustomerPortal();

  const subscription = subData?.data;

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Plans</h1>
          <p className="text-gray-400 mt-2">Manage your subscription, limits, and billing history.</p>
        </div>
        
        {subscription && (
          <button 
            onClick={() => portal.mutate()}
            disabled={portal.isPending}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-medium"
          >
            {portal.isPending ? 'Loading Portal...' : 'Manage Billing & Invoices'}
            <ExternalLink size={16} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-gray-400 mb-12">Loading current subscription...</div>
      ) : subscription ? (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Current Subscription</h2>
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">{subscription.planName}</h3>
                <span className="px-2 py-1 bg-vault-green/10 text-vault-green text-xs font-bold rounded-lg">ACTIVE</span>
              </div>
              <p className="text-gray-400">
                ${subscription.amount} / {subscription.interval.toLowerCase()} 
                <span className="mx-2">•</span> 
                Renews on {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-48">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">AI Tokens</span>
                  <span className="text-white">{subscription.aiTokensUsed.toLocaleString()} / {subscription.plan?.maxAiTokens.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-vault-green rounded-full" 
                    style={{ width: `${Math.min((subscription.aiTokensUsed / subscription.plan?.maxAiTokens) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-12 bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl text-center">
          <Zap className="mx-auto text-gray-500 mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">You are on the Free Plan</h3>
          <p className="text-gray-400">Upgrade to unlock advanced features, increased limits, and premium support.</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Available Plans</h2>
        <PlanComparison currentPlanId={subscription?.planId} />
      </div>
    </div>
  );
}
