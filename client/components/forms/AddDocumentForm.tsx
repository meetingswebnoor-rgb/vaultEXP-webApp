'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Globe, ChevronRight, Loader2, X, File } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const documentSchema = z.object({
  name: z.string().min(2, 'Document name is required'),
  context: z.string().default('vault'),
  category: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function AddDocumentForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      context: 'vault',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: DocumentFormValues) => {
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', data.name);
      formData.append('context', data.context);
      if (data.category) formData.append('category', data.category);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Document uploaded successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* File Dropzone */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">File Attachment</label>
        <div 
          className={cn(
            "relative group border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 text-center",
            file ? "border-vault-green/40 bg-vault-green/5" : "border-white/10 hover:border-vault-green/30 hover:bg-white/5"
          )}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          {file ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-vault-green/10 flex items-center justify-center text-vault-green">
                <File size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-vault-green transition-colors">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tap to upload or drag & drop</p>
                <p className="text-[10px] text-gray-500">PDF, JPG, PNG or DOC (max 10MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <FileText size={12} className="text-vault-green" />
          Document Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Q3 Tax Report"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.name && "border-red-500/50"
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Context */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Globe size={12} className="text-blue-400" />
            Context
          </label>
          <select
            {...register('context')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="vault">Personal Vault</option>
            <option value="business">Business</option>
            <option value="property">Property</option>
            <option value="investment">Investment</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
          <input
            {...register('category')}
            placeholder="e.g. Legal, Tax"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        type="submit"
        className="w-full flex items-center justify-between px-8 py-5 rounded-[1.25rem] bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="flex items-center gap-2">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Upload Document'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}
