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

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
