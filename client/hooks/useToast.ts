'use client';

import { useToast as useUiToast } from '@/components/ui/Toast';

export function useToast() {
  const { showToast } = useUiToast();

  const addToast = ({ title, message, type }: { title?: string; message: string; type?: 'success' | 'error' | 'info' }) => {
    // We concatenate title and message if both exist
    const fullMessage = title ? `${title}: ${message}` : message;
    showToast(fullMessage, type);
  };

  return { addToast, showToast };
}
