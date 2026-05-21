'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, FolderOpen, X, CheckCircle, RefreshCw } from 'lucide-react';
import { useActionStore } from '@/store/actionStore';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils/cn';

export function MobileUploadSheet() {
  const { activeAction, isOpen, closeAction } = useActionStore();
  
  // Custom hook usage with AI context
  const {
    files,
    setFiles,
    startUpload,
    handleFileSelect,
    cancelUpload,
    retryUpload,
    clearFiles
  } = useFileUpload({ 
    context: { analyze: true, category: 'mobile_scan' } 
  });

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // We only show this sheet if the active action is 'document'
  const isSheetOpen = isOpen && activeAction === 'document';

  const handleClose = () => {
    closeAction();
    // Delay clearing files slightly so it doesn't vanish mid-animation
    setTimeout(clearFiles, 300);
  };

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0A0E13] border-t border-white/10 rounded-t-3xl z-[111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 flex-shrink-0" onClick={handleClose}>
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Upload Document</h3>
                  <p className="text-xs text-gray-400 mt-1">AI will extract text and categorize automatically.</p>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Progress Area */}
              {files.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-3 mb-6 custom-scrollbar pr-2">
                  {files.map(file => (
                    <motion.div
                      key={file.id}
                      layout
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4 relative overflow-hidden"
                    >
                      {file.status === 'uploading' && (
                        <motion.div 
                          className="absolute inset-y-0 left-0 bg-vault-green/10 -z-10"
                          initial={{ width: '0%' }}
                          animate={{ width: `${file.progress}%` }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-500 uppercase tracking-wider">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          {file.status === 'uploading' && (
                            <span className="text-[11px] font-bold text-vault-green ml-2">{file.progress}%</span>
                          )}
                          {file.status === 'success' && (
                            <span className="text-[11px] font-bold text-vault-green ml-2 flex items-center gap-1"><CheckCircle size={10} /> AI Analyzing...</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'error' && (
                          <button onClick={() => retryUpload(file)} className="p-2 text-red-400"><RefreshCw size={16} /></button>
                        )}
                        {file.status !== 'success' && (
                          <button onClick={() => cancelUpload(file.id)} className="p-2 text-gray-400"><X size={16} /></button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 min-h-[40px]" />
              )}

              {/* Action Buttons */}
              <div className="space-y-3 flex-shrink-0 mt-auto">
                {/* 1. Camera - Capture Environment */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-vault-green/20 to-vault-green/5 border border-vault-green/20 hover:border-vault-green/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-vault-green/20 text-vault-green flex items-center justify-center">
                    <Camera size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-bold text-white">Scan Document</div>
                    <div className="text-xs text-vault-green">Open Camera</div>
                  </div>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* 2. Photo Library */}
                <button
                  onClick={() => libraryInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ImageIcon size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-bold text-white">Photo Library</div>
                    <div className="text-xs text-gray-400">Choose images</div>
                  </div>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={libraryInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />

                {/* 3. Browse Files */}
                <button
                  onClick={() => filesInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <FolderOpen size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-bold text-white">Browse Files</div>
                    <div className="text-xs text-gray-400">PDF, Word, Excel</div>
                  </div>
                </button>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.csv,.txt"
                  ref={filesInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
