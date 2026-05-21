import { useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

/**
 * Custom hook to register socket events without duplicating listeners.
 * 
 * @param eventName The event name to listen to (e.g. 'new-message')
 * @param callback The function to run when the event occurs
 */
export function useSocketEvent(eventName: string, callback: (data: any) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
}
