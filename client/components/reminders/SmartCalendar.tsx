'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function SmartCalendar({ events }: { events: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="bg-vault-dark border border-white/5 rounded-[24px] p-6 shadow-xl shrink-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/5 blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-vault-green" />
          Smart Calendar
        </h3>
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
          <button className="p-1 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-300 w-24 text-center">
            {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
          </span>
          <button className="p-1 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-3 relative z-10">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 relative z-10">
        {days.map((day, i) => {
          const hasEvent = day && events.some(e => e.date === day);
          const isAIEvent = day && events.some(e => e.date === day && e.isAI);
          
          return (
            <div 
              key={i} 
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative group cursor-pointer transition-all",
                day ? "hover:bg-white/10 hover:border-white/20 border border-transparent bg-white/[0.02]" : "opacity-0 pointer-events-none",
                hasEvent && !isAIEvent && "bg-vault-green/10 border-vault-green/30 text-vault-green font-bold shadow-[0_0_10px_rgba(0,255,136,0.1)]",
                isAIEvent && "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              )}
            >
              {day}
              {hasEvent && (
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full absolute bottom-1.5", 
                  isAIEvent ? "bg-indigo-400 shadow-[0_0_5px_#818cf8]" : "bg-vault-green shadow-[0_0_5px_#00ff99]"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
