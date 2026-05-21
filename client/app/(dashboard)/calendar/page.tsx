'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Bot, 
  Sparkles,
  Loader2,
  Wrench,
  Users,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Simple state for currently viewed month
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0).toISOString();

      const res = await api.get(`/api/calendar?start=${start}&end=${end}`);
      setEvents(res.data.data.events);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await api.post('/api/calendar/optimize');
      setAiAdvice(res.data.data.advice);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Calendar logic helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eDate = new Date(e.startTime);
      return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'TASK_DEADLINE': return 'bg-vault-green/20 text-vault-green border-vault-green/30';
      case 'MAINTENANCE': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <Users size={10} />;
      case 'TASK_DEADLINE': return <CheckCircle2 size={10} />;
      case 'MAINTENANCE': return <Wrench size={10} />;
      default: return <Clock size={10} />;
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <PageHeader 
          title="Enterprise Scheduling" 
          description="Master calendar for tasks, CRM meetings, and property maintenance." 
        />
        <div className="flex gap-3">
          <button 
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 disabled:opacity-50 font-bold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            {optimizing ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />} 
            AI Optimize
          </button>
          <button className="bg-vault-green text-black hover:bg-vault-green/90 font-bold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <Plus size={16} /> New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Calendar View */}
        <div className="xl:col-span-3 bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-vault-green" />
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
              <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Grid Render */}
          <div className="flex-1 bg-black/20 p-4">
            <div className="grid grid-cols-7 gap-4 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 auto-rows-fr">
              {blanks.map(b => (
                <div key={`blank-${b}`} className="min-h-[100px] rounded-xl bg-white/[0.01] border border-transparent" />
              ))}
              
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div key={day} className={cn(
                    "min-h-[120px] rounded-xl border p-2 flex flex-col transition-colors",
                    isToday ? "bg-vault-green/5 border-vault-green/30" : "bg-vault-card border-white/5 hover:border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                        isToday ? "bg-vault-green text-black" : "text-gray-400"
                      )}>
                        {day}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                      {loading ? (
                        <div className="w-full h-6 bg-white/5 animate-pulse rounded-md" />
                      ) : dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          className={cn("text-[10px] px-2 py-1.5 rounded-lg border flex items-center gap-1.5 truncate cursor-pointer hover:opacity-80 transition-opacity", getEventStyle(e.type))}
                          title={e.title}
                        >
                          {getEventIcon(e.type)}
                          <span className="truncate font-medium">{e.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar AI Assistant & Mini Schedule */}
        <div className="space-y-6">
          
          {/* AI Optimizer Panel */}
          <div className="bg-[#080C0F]/65 border border-indigo-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bot size={16} className="text-indigo-400" /> Schedule Assistant
            </h3>

            {aiAdvice ? (
              <div className="text-sm text-gray-300 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 whitespace-pre-wrap relative z-10">
                {aiAdvice}
              </div>
            ) : (
              <div className="text-center py-6 relative z-10">
                <Sparkles size={32} className="mx-auto text-indigo-500/30 mb-3" />
                <p className="text-xs text-gray-400 font-medium">Click &quot;AI Optimize&quot; to scan your upcoming schedule for conflicts and strategic deep-work opportunities.</p>
              </div>
            )}
          </div>

          {/* Quick Legend / Integration Status */}
          <div className="bg-vault-card border border-white/5 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Integrations</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 text-blue-300">
                  <Users size={14} /> <span>CRM Meetings</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-vault-green/5 border border-vault-green/10">
                <div className="flex items-center gap-2 text-vault-green">
                  <CheckCircle2 size={14} /> <span>Task Deadlines</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-vault-green" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2 text-orange-300">
                  <Wrench size={14} /> <span>Property Schedules</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
