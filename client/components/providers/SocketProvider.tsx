'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);
  
  useEffect(() => {
    const rawToken = typeof window !== 'undefined' ? localStorage.getItem('vault_auth_token') : null;
    const activeToken = token || rawToken;

    if (!activeToken) {
      return; 
    }

    // Socket connects to backend ROOT (without /api suffix)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vaultexp-webapp-production.up.railway.app/api';
    const socketUrl = apiUrl.replace(/\/api$/, '');
    const socketInstance = io(socketUrl, {
      auth: { token: activeToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
