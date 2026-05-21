import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ActionNode({ data, selected }: any) {
  return (
    <div className={cn("px-4 py-3 shadow-xl rounded-2xl bg-[#0B0F13]/90 border backdrop-blur-md transition-all min-w-[200px]", selected ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-white/10 hover:border-white/20')}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-[#0B0F13] rounded-full" />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Action Step</p>
          <h3 className="text-xs font-bold text-white leading-none">{data.label || 'Execute Action'}</h3>
        </div>
      </div>
      {data.details && (
        <div className="text-[10px] text-gray-400 mt-3 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05] leading-relaxed">
          {data.details}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400 border-2 border-[#0B0F13] rounded-full" />
    </div>
  );
}
