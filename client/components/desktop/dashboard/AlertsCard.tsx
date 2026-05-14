'use client';

import { motion } from 'framer-motion';
import { Bell, AlertCircle, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ALERTS = [
  { id: 1, title: 'Security breach attempt blocked', sub: 'IP: 192.168.1.45 blocked by firewall', type: 'error', icon: AlertCircle },
  { id: 2, title: 'Subscription renewal soon', sub: 'Enterprise plan expires in 12 days', type: 'warning', icon: AlertTriangle },
  { id: 3, title: 'Backup completed successfully', sub: 'All 12 vaults backed up to decentralized storage', type: 'success', icon: ShieldCheck },
  { id: 4, title: 'Unusual login location', sub: 'Detected login from London, UK', type: 'warning', icon: AlertTriangle },
];

const ALERT_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  error:   { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400' },
  warning: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400' },
  success: { bg: 'bg-vault-green/10', border: 'border-vault-green/20', icon: 'text-vault-green' },
};

export function AlertsCard() {
  return (
    <div className="rounded-2xl border border-vault-border/60 bg-vault-card/40 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-vault-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-vault-dark/60 flex items-center justify-center text-gray-500">
            <Bell size={16} />
          </div>
          <h3 className="text-sm font-semibold text-white">System Alerts</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-vault-dark/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
          4 New
        </span>
      </div>

      {/* Alerts List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {ALERTS.map((alert) => {
          const style = ALERT_STYLES[alert.type];
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn('p-4 rounded-xl border flex gap-4 transition-all hover:scale-[1.01]', style.bg, style.border)}
            >
              <div className={cn('flex-shrink-0 mt-0.5', style.icon)}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">{alert.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{alert.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-vault-border/40">
        <button className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider">
          Clear All Alerts
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
