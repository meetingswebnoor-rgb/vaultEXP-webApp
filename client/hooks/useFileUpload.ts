import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  error?: string;
  controller?: AbortController;
}

export const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/heic',
  'image/webp',
  'text/csv',
  'text/plain'
];

interface UseFileUploadProps {
  onUploadSuccess?: (files: any[]) => void;
  context?: {
    businessId?: string;
    propertyId?: string;
    vaultId?: string;
    folderId?: string;
    category?: string;
    isPrivate?: boolean;
    analyze?: boolean; // For AI extraction
  };
}

export function useFileUpload({ onUploadSuccess, context }: UseFileUploadProps = {}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((s) => s.token);

  const validateFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = [];
    newFiles.forEach((file) => {
      const isAllowed = ALLOWED_TYPES.includes(file.type) || file.type.startsWith('image/');
      if (!isAllowed) {
        validFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          progress: 0,
          status: 'error',
          error: 'File type not supported'
        });
        return;
      }
      validFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'pending'
      });
    });
    return validFiles;
  }, []);

  const startUpload = useCallback(async (uploadFile: UploadFile) => {
    const controller = new AbortController();
    
    setFiles((prev) => prev.map((f) => 
      f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0, controller, error: undefined } : f
    ));

    const formData = new FormData();
    formData.append('file', uploadFile.file);
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value));
      });
    }

    try {
      const response = await api.post(
        '/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setFiles((prev) => prev.map((f) => 
              f.id === uploadFile.id ? { ...f, progress: percentCompleted } : f
            ));
          }
        }
      );

      setFiles((prev) => prev.map((f) => 
        f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
      ));

      if (onUploadSuccess && response.data.documents) {
        onUploadSuccess(response.data.documents);
      }

    } catch (error: any) {
      if (axios.isCancel(error)) {
        setFiles((prev) => prev.map((f) => 
          f.id === uploadFile.id ? { ...f, status: 'cancelled', progress: 0 } : f
        ));
      } else {
        setFiles((prev) => prev.map((f) => 
          f.id === uploadFile.id ? { 
            ...f, 
            status: 'error', 
            error: error.response?.data?.error || 'Upload failed' 
          } : f
        ));
      }
    }
  }, [context, token, onUploadSuccess]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newValidFiles = validateFiles(Array.from(e.target.files));
      setFiles((prev) => [...prev, ...newValidFiles]);
      newValidFiles.filter(f => f.status === 'pending').forEach(startUpload);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [validateFiles, startUpload]);

  const cancelUpload = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.controller && file.status === 'uploading') {
      file.controller.abort();
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    }
  }, [files]);

  const retryUpload = useCallback((file: UploadFile) => {
    startUpload(file);
  }, [startUpload]);

  const clearFiles = useCallback(() => setFiles([]), []);

  return {
    files,
    setFiles,
    fileInputRef,
    validateFiles,
    startUpload,
    handleFileSelect,
    cancelUpload,
    retryUpload,
    clearFiles
  };
}
