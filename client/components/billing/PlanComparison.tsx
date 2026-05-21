'use client';

import { motion } from 'framer-motion';
import { usePlans, useCheckout } from '@/hooks/useBilling';
import { Check, ShieldAlert, Zap } from 'lucide-react';
import { useState } from 'react';

export default function PlanComparison({ currentPlanId }: { currentPlanId?: string }) {
  const { data: plansData, isLoading } = usePlans();
  const checkout = useCheckout();
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  if (isLoading) return <div className="text-gray-400">Loading plans...</div>;

  // Filter plans based on selected interval, assuming the db has separate records or we just group them.
  // For simplicity, let's assume the DB has plans for both intervals and we filter them.
  const plans = plansData?.data?.filter((p: any) => p.interval === interval) || [];

  // Fallback if DB is empty
  const displayPlans = plans.length > 0 ? plans : MOCK_PLANS.filter(p => p.interval === interval);

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="bg-white/[0.02] border border-white/[0.05] p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setInterval('MONTHLY')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${interval === 'MONTHLY' ? 'bg-vault-green text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setInterval('YEARLY')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${interval === 'YEARLY' ? 'bg-vault-green text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPlans.map((plan: any) => {
          const isCurrent = currentPlanId === plan.id;
          return (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl border flex flex-col ${
                plan.name === 'Enterprise' 
                  ? 'border-vault-green bg-vault-green/[0.02] relative overflow-hidden' 
                  : 'border-white/[0.05] bg-white/[0.02]'
              }`}
            >
              {plan.name === 'Enterprise' && (
                <div className="absolute top-0 right-0 bg-vault-green text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                  RECOMMENDED
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${Number(plan.price)}</span>
                <span className="text-gray-400 mb-1">/{interval === 'MONTHLY' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <FeatureItem text={`${plan.maxStorage / 1024}GB Secure Storage`} />
                <FeatureItem text={`${plan.maxAiTokens.toLocaleString()} AI Agent Tokens`} />
                <FeatureItem text={`${plan.maxAutomation} Active Automations`} />
                <FeatureItem text={`${plan.maxTeamMembers} Team Members`} />
                <FeatureItem text={`${plan.maxUploads} Uploads / Month`} />
              </ul>

              <button 
                onClick={() => !isCurrent && checkout.mutate(plan.stripePriceId)}
                disabled={isCurrent || checkout.isPending}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isCurrent 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : plan.name === 'Enterprise'
                      ? 'bg-vault-green text-black hover:bg-vault-green/90 shadow-[0_0_20px_rgba(205,255,115,0.2)]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {checkout.isPending ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-gray-300">
      <div className="bg-vault-green/20 p-1 rounded-full text-vault-green">
        <Check size={12} strokeWidth={3} />
      </div>
      <span className="text-sm">{text}</span>
    </li>
  );
}

const MOCK_PLANS = [
  { id: '1', name: 'Pro', price: 29, interval: 'MONTHLY', stripePriceId: 'price_pro_mo', maxStorage: 5120, maxAiTokens: 100000, maxAutomation: 10, maxTeamMembers: 3, maxUploads: 500 },
  { id: '2', name: 'Enterprise', price: 99, interval: 'MONTHLY', stripePriceId: 'price_ent_mo', maxStorage: 51200, maxAiTokens: 500000, maxAutomation: 50, maxTeamMembers: 10, maxUploads: 5000 },
  { id: '3', name: 'Scale', price: 299, interval: 'MONTHLY', stripePriceId: 'price_scale_mo', maxStorage: 512000, maxAiTokens: 2000000, maxAutomation: 500, maxTeamMembers: 50, maxUploads: 50000 },
];
