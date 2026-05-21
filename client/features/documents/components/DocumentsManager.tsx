'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, Document } from '../api/documentApi';
import { UploadCloud, File, FileText, Search, BrainCircuit, Loader2, Trash2, Shield, Download, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = [
  { id: 'all', label: 'All Files' },
  { id: 'contract', label: 'Contracts' },
  { id: 'invoice', label: 'Invoices' },
  { id: 'license', label: 'Licenses' },
  { id: 'legal', label: 'Legal' },
  { id: 'tax', label: 'Tax' },
];

export function DocumentManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('contract');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', activeCategory, search],
    queryFn: () => documentApi.getDocuments({
      category: activeCategory !== 'all' ? activeCategory : undefined,
      search: search || undefined
    })
  });

  const uploadMutation = useMutation({
    mutationFn: documentApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast({ title: 'Success', message: 'Document uploaded securely.', type: 'success' });
      setIsUploading(false);
    },
    onError: () => {
      addToast({ title: 'Error', message: 'Failed to upload document.', type: 'error' });
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast({ title: 'Deleted', message: 'Document removed from vault.', type: 'success' });
    }
  });

  const aiMutation = useMutation({
    mutationFn: documentApi.processAI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast({ title: 'AI Processed', message: 'Document analyzed successfully.', type: 'success' });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    if (file.size > 20 * 1024 * 1024) {
      addToast({ title: 'Error', message: 'File must be less than 20MB', type: 'error' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('category', uploadCategory);
    
    uploadMutation.mutate(formData);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-400" />;
      case 'spreadsheet': return <File className="text-green-400" />;
      case 'image': return <File className="text-blue-400" />;
      default: return <File className="text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-vault-green" />
            Upload File
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-vault-green"
              >
                <option value="contract">Contract</option>
                <option value="invoice">Invoice</option>
                <option value="license">License</option>
                <option value="legal">Legal Document</option>
                <option value="tax">Tax Document</option>
                <option value="operational">Operational</option>
              </select>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-vault-green/10 hover:bg-vault-green/20 border border-vault-green/30 text-vault-green rounded-xl py-3 px-4 font-medium transition-all flex justify-center items-center gap-2"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {isUploading ? 'Uploading...' : 'Select File'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                  activeCategory === cat.id 
                    ? 'bg-vault-green text-black font-semibold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search secure documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-vault-green"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-vault-green bg-vault-green/10 px-4 py-2 rounded-full border border-vault-green/20">
            <Shield className="w-4 h-4" />
            <span>Encrypted Vault Storage</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <File className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white font-medium mb-1">No documents found</h3>
              <p className="text-white/50 text-sm max-w-sm mx-auto">
                Upload your first contract, invoice, or license to get started. All files are securely encrypted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {documents.map((doc) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 hover:bg-white/5 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                  >
                    <div className="p-3 bg-black/30 rounded-xl border border-white/10 shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{doc.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                        <span className="text-vault-green bg-vault-green/10 px-2 py-0.5 rounded capitalize">
                          {doc.category}
                        </span>
                        <span className="text-white/40">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="text-white/40">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* AI Summary Section - Future Tech Highlight */}
                      {doc.aiSummary ? (
                        <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200 flex gap-2 items-start">
                          <BrainCircuit className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <p>{doc.aiSummary}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0 justify-end">
                      {!doc.aiSummary && (
                        <button
                          onClick={() => aiMutation.mutate(doc._id)}
                          disabled={aiMutation.isPending}
                          title="Read with AI"
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          {aiMutation.isPending && aiMutation.variables === doc._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <BrainCircuit className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Download"
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      
                      <button
                        onClick={() => deleteMutation.mutate(doc._id)}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
