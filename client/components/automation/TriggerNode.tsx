import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function TriggerNode({ data, selected }: any) {
  return (
    <div className={cn("px-4 py-3 shadow-xl rounded-2xl bg-white/[0.03] border backdrop-blur-md transition-all min-w-[200px]", selected ? 'border-vault-green ring-1 ring-vault-green/20' : 'border-white/10 hover:border-white/20')}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-vault-green/10 border border-vault-green/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-vault-green" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Trigger Event</p>
          <h3 className="text-xs font-bold text-white leading-none">{data.label || 'Select Event'}</h3>
        </div>
      </div>
      {data.condition && (
        <div className="text-[10px] bg-black/40 px-2.5 py-2 rounded-xl border border-white/5 text-gray-400 mt-3 font-medium">
          <span className="text-vault-green font-bold">IF</span> {data.condition}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-vault-green border-2 border-[#0B0F13] rounded-full" />
    </div>
  );
}
