import Link from 'next/link';
import { TrendingUp, TrendingDown, Activity, Bitcoin, Briefcase, Box } from 'lucide-react';
import { calculateInvestmentPerformance } from '@/lib/utils/investment';

interface InvestmentListCardProps {
  _id: string;
  name: string;
  type: string;
  currentValue: number;
  amountInvested: number;
}

export function InvestmentListCard({ _id, name, type, currentValue, amountInvested }: InvestmentListCardProps) {
  const { profitLoss, percentage, isPositive } = calculateInvestmentPerformance(currentValue, amountInvested);

  const getIcon = () => {
    switch (type) {
      case 'stock': return <Activity size={18} />;
      case 'crypto': return <Bitcoin size={18} />;
      case 'business': return <Briefcase size={18} />;
      default: return <Box size={18} />;
    }
  };

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(currentValue || 0);

  const formattedProfit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  }).format(profitLoss || 0);

  return (
    <Link href={`/investment/${_id}`} className="block">
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vault-dark/50 border border-vault-border/50 flex items-center justify-center text-vault-green shadow-[0_0_15px_rgba(0,255,136,0.1)]">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-white font-bold text-base truncate max-w-[150px]">{name}</h3>
            <p className="text-gray-500 text-xs capitalize">{type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold font-display">{formattedValue}</p>
          <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${isPositive ? 'text-vault-green' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{formattedProfit}</span>
            <span className="opacity-75">({percentage.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
