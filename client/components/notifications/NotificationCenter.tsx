'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useSocket } from '@/components/providers/SocketProvider';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isConnected } = useSocket();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
    
    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(listRes.data.data.notifications.slice(0, 5)); // Just top 5 for popover
      setUnreadCount(countRes.data.data.count);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  // Listen to the realtime event from the global socket provider
  useSocketEvent('new_notification', (newNotif) => {
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    setUnreadCount(prev => prev + 1);
    
    // Optional: Native desktop notification
    if (Notification.permission === 'granted') {
      new Notification('VaultEXP', {
        body: newNotif.message,
        icon: '/favicon.ico'
      });
    }
  });

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFull = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors relative"
      >
        <Bell size={18} className="text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#05050A] text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Realtime indicator */}
        {isConnected && <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-vault-green shadow-[0_0_8px_rgba(0,255,136,0.8)]" title="Realtime Active" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-80 bg-vault-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={() => router.push('/settings/notifications')} className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
                  Settings
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">No recent notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (n.link) {
                          setIsOpen(false);
                          router.push(n.link);
                        }
                      }}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors ${!n.isRead ? 'bg-white/[0.04] hover:bg-white/[0.06]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.isRead ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={(e) => handleMarkRead(n.id, e)}
                          className="shrink-0 w-6 h-6 rounded bg-vault-green/10 text-vault-green flex items-center justify-center hover:bg-vault-green hover:text-black transition-colors"
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={handleOpenFull}
                className="w-full py-2 text-xs font-bold text-center text-vault-green hover:bg-vault-green/10 rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
