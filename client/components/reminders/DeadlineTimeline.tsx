'use client';
import { Clock, Zap, BrainCircuit, FileText, Briefcase, FileSignature, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const categoryIcons: Record<string, any> = {
  lease: FileSignature,
  invoice: Briefcase,
  tax: FileText,
  insurance: AlertCircle,
  ai: BrainCircuit,
};

export function DeadlineTimeline({ deadlines }: { deadlines: any[] }) {
  return (
    <div className="bg-vault-dark border border-white/5 rounded-[24px] p-6 shadow-xl flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Critical Timeline
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-vault-green bg-vault-green/10 border border-vault-green/20 px-3 py-1.5 rounded-xl shadow-sm">
          Auto-Prioritized
        </span>
      </div>

      <div className="relative flex-1 overflow-y-auto pr-4 custom-scrollbar z-10">
        {/* Vertical Line */}
        <div className="absolute top-0 bottom-0 left-[23px] w-[2px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
        
        <div className="space-y-6">
          {deadlines.map((d, i) => {
            const Icon = categoryIcons[d.category] || Zap;
            const isHighPriority = d.priority === 'high';
            const isAI = d.category === 'ai';

            return (
              <div key={i} className="relative flex items-start gap-5 group">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border z-10 shrink-0 transition-transform group-hover:scale-110",
                  isAI ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]" :
                  isHighPriority ? "bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-black/60 border-white/10 backdrop-blur-md"
                )}>
                  <Icon className={cn("w-5 h-5", 
                    isAI ? "text-indigo-400" :
                    isHighPriority ? "text-red-400" : "text-gray-400"
                  )} />
                </div>
                
                <div className={cn(
                  "flex-1 p-5 rounded-2xl border transition-all",
                  isAI ? "border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.06]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={cn("text-sm font-bold", isAI ? "text-indigo-300" : "text-white")}>{d.title}</h4>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border",
                      isHighPriority ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-black/40 text-gray-400 border-white/10"
                    )}>
                      {d.timeLeft}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{d.description}</p>
                  
                  {isAI && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest shadow-sm">
                      <BrainCircuit className="w-3.5 h-3.5" /> AI Detected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
