'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { 
  Bell, Check, AtSign, CheckCircle2, Bot, Users, 
  Settings, Loader2, RefreshCw, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useSocket } from '@/components/providers/SocketProvider';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'MENTION' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { isConnected: isSocketConnected } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useSocketEvent('new_notification', (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDemo = async () => {
    try {
      await api.post('/api/notifications/demo');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'MENTION') return n.type === 'MENTION';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'MENTION': return <AtSign size={16} className="text-blue-400" />;
      case 'ASSIGNMENT': return <CheckCircle2 size={16} className="text-vault-green" />;
      case 'AI_ALERT': return <Bot size={16} className="text-purple-400" />;
      case 'CRM_ALERT': return <Users size={16} className="text-orange-400" />;
      default: return <Settings size={16} className="text-gray-400" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'MENTION': return 'bg-blue-500/10 border-blue-500/20';
      case 'ASSIGNMENT': return 'bg-vault-green/10 border-vault-green/20';
      case 'AI_ALERT': return 'bg-purple-500/10 border-purple-500/20';
      case 'CRM_ALERT': return 'bg-orange-500/10 border-orange-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <PageHeader 
          title="Notification Center" 
          description="Real-time alerts, mentions, and proactive AI warnings." 
        />
        <div className="flex gap-3">
          <button 
            onClick={triggerDemo}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Trigger Demo Mention
          </button>
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors"
          >
            <Check size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="space-y-4">
          <div className="bg-vault-card border border-white/5 rounded-2xl p-4 shadow-xl space-y-2">
            <button 
              onClick={() => setFilter('ALL')}
              className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors", filter === 'ALL' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
            >
              <span className="flex items-center gap-2"><Bell size={16} /> All Inbox</span>
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors", filter === 'UNREAD' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
            >
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Unread</span>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            <button 
              onClick={() => setFilter('MENTION')}
              className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-colors", filter === 'MENTION' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
            >
              <span className="flex items-center gap-2"><AtSign size={16} /> Mentions</span>
            </button>
          </div>

          <div className="bg-[#080C0F]/65 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vault-green/5 blur-[40px] pointer-events-none" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 relative z-10 flex items-center gap-2">
              <RefreshCw size={14} className={cn("text-vault-green", isSocketConnected ? "animate-spin-slow" : "")} /> 
              Socket.IO Status
            </h3>
            <p className={cn("text-sm font-bold", isSocketConnected ? "text-vault-green" : "text-red-400")}>
              {isSocketConnected ? "Connected (Real-time Active)" : "Disconnected"}
            </p>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              {filter === 'ALL' ? 'Inbox' : filter === 'UNREAD' ? 'Unread Alerts' : 'Mentions'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {loading ? (
              <div className="h-full flex items-center justify-center p-12">
                <Loader2 size={32} className="animate-spin text-gray-500" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-4">
                <Bell size={48} className="opacity-50" />
                <p className="font-bold">You&apos;re all caught up! No notifications here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNotifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-5 flex items-start gap-4 transition-colors cursor-pointer",
                      !n.isRead ? "bg-white/[0.03] hover:bg-white/[0.05]" : "hover:bg-white/[0.02] opacity-70"
                    )}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id, { stopPropagation: () => {} } as any);
                      if (n.link) window.location.href = n.link;
                    }}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0", getStyle(n.type))}>
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <p className={cn("text-sm leading-relaxed", !n.isRead ? "text-white font-bold" : "text-gray-300 font-medium")}>
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => markAsRead(n.id, e)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-vault-green flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                        {n.link && (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                            Click to open context
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
