'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFileUpload, UploadFile } from '@/hooks/useFileUpload';

interface FileUploadProps {
  onUploadSuccess?: (files: any[]) => void;
  context?: {
    businessId?: string;
    propertyId?: string;
    vaultId?: string;
    folderId?: string;
    category?: string;
    isPrivate?: boolean;
    analyze?: boolean;
  };
}

export function FileUpload({ onUploadSuccess, context }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    files,
    setFiles,
    fileInputRef,
    validateFiles,
    startUpload,
    handleFileSelect,
    cancelUpload,
    retryUpload
  } = useFileUpload({ onUploadSuccess, context });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newValidFiles = validateFiles(Array.from(e.dataTransfer.files));
      setFiles((prev) => [...prev, ...newValidFiles]);
      newValidFiles.filter((f) => f.status === 'pending').forEach(startUpload);
    }
  }, [validateFiles, setFiles, startUpload]);

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300",
          isDragging 
            ? "border-vault-green bg-vault-green/10 scale-[1.02]" 
            : "border-vault-border bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
        )}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors",
          isDragging ? "bg-vault-green text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]" : "bg-vault-card border border-vault-border text-vault-green"
        )}>
          <UploadCloud size={28} strokeWidth={isDragging ? 2.5 : 2} />
        </div>
        
        <h3 className="text-base font-semibold text-white mb-1 font-display">
          Drop files to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
          PDF, DOCX, XLSX, JPG, PNG, CSV, TXT (Max 50MB)
        </p>
        
        <button className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
          Browse Files
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
        />
      </div>

      {/* Upload List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden group"
              >
                {/* Progress Background */}
                {file.status === 'uploading' && (
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-vault-green/[0.05] -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                )}

                {/* Icon */}
                <div className={cn(
                  "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border",
                  file.status === 'success' ? "bg-vault-green/10 border-vault-green/20 text-vault-green" :
                  file.status === 'error' || file.status === 'cancelled' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                  "bg-white/[0.05] border-white/10 text-gray-400"
                )}>
                  {file.status === 'success' ? <CheckCircle size={20} /> :
                   file.status === 'error' ? <AlertCircle size={20} /> :
                   <FileIcon size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{file.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {file.status === 'uploading' && (
                      <>
                        <span className="text-[11px] text-vault-green">•</span>
                        <span className="text-[11px] font-bold text-vault-green">{file.progress}%</span>
                      </>
                    )}
                    {file.status === 'error' && (
                      <span className="text-[11px] text-red-400 truncate">{file.error}</span>
                    )}
                    {file.status === 'cancelled' && (
                      <span className="text-[11px] text-gray-400">Cancelled</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(file.status === 'error' || file.status === 'cancelled') && (
                    <button 
                      onClick={() => retryUpload(file)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Retry"
                    >
                      <RefreshCw size={16} />
                    </button>
                  )}
                  {file.status !== 'success' && (
                    <button 
                      onClick={() => cancelUpload(file.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Cancel/Remove"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {file.status === 'success' && (
                    <button 
                      onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      title="Clear"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
