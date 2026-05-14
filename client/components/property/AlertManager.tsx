'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Trash2, Zap, RefreshCw } from 'lucide-react';
import { alertApi, PropertyAlert } from '@/features/property/alertApi';
import { cn } from '@/lib/utils/cn';

const PRIORITY_STYLES: Record<string, { bg: string, text: string, border: string, icon: any }> = {
  critical: { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/20',   icon: AlertCircle },
  high:     { bg: 'bg-orange-500/10',text: 'text-orange-400',border: 'border-orange-500/20',icon: AlertCircle },
  medium:   { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock },
  low:      { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/20',  icon: Clock },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AlertManager({ propertyId }: { propertyId: string }) {
  const qc = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', propertyId],
    queryFn: () => alertApi.list(propertyId),
  });

  const generateMut = useMutation({
    mutationFn: () => alertApi.autoGenerate(propertyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', propertyId] }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => alertApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', propertyId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => alertApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', propertyId] }),
  });

  const activeAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'seen');

  if (isLoading) return null;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-amber-400" /> System Alerts
          {activeAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px]">{activeAlerts.length}</span>
          )}
        </h3>
        <button 
          onClick={() => generateMut.mutate()}
          disabled={generateMut.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wide disabled:opacity-50"
        >
          {generateMut.isPending ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Scan System
        </button>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
          <p className="text-[13px] text-gray-500">No pending alerts. System is clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {activeAlerts.map(alert => {
              const style = PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.medium;
              const Icon = style.icon;

              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  className={cn("relative p-4 rounded-2xl border flex flex-col justify-between overflow-hidden group", style.bg, style.border)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <Icon size={18} className={cn("flex-shrink-0 mt-0.5", style.text)} />
                    <div>
                      <h4 className={cn("text-[14px] font-bold leading-tight mb-1", style.text)}>{alert.title}</h4>
                      <p className={cn("text-[13px] opacity-80", style.text)}>{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", style.text)}>
                      {fmtDate(alert.date)}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => statusMut.mutate({ id: alert._id, status: 'completed' })}
                        className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-colors", style.text)}
                      >
                        <CheckCircle2 size={12} /> Resolve
                      </button>
                      <button 
                        onClick={() => deleteMut.mutate(alert._id)}
                        className={cn("p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
