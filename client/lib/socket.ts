import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

let socket: Socket | null = null;

export const getSocket = () => {
  if (socket) return socket;

  const token = useAuthStore.getState().token;
  
  if (!token) {
    console.warn('Cannot initialize socket without token');
    return null;
  }

  // Socket connects to backend ROOT (without /api suffix)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vaultexp-webapp-production.up.railway.app/api';
  const backendUrl = apiUrl.replace(/\/api$/, '');

  socket = io(backendUrl, {
    auth: { token }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
