'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Type, Calendar, Link as LinkIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, DocumentFormData, PropertyDocument } from '@/features/property/documentApi';
import { GlobalModal } from '@/components/ui/GlobalModal';

const DOC_TYPES = [
  'lease_agreement', 'insurance', 'mortgage', 'title_deed',
  'tax_certificate', 'inspection_report', 'utility_bill', 'other'
];

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  doc?: PropertyDocument;
}

export function DocumentModal({ isOpen, onClose, propertyId, doc }: DocumentModalProps) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    type: 'lease_agreement',
    fileUrl: '',
    notes: '',
    expiresAt: '',
    mimeType: '',
    sizeBytes: 0,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (doc) {
      setFormData({
        name: doc.name,
        type: doc.type,
        fileUrl: doc.fileUrl,
        notes: doc.notes ?? '',
        expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString().split('T')[0] : '',
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
      });
    } else {
      setFormData({
        name: '',
        type: 'lease_agreement',
        fileUrl: '',
        notes: '',
        expiresAt: '',
        mimeType: '',
        sizeBytes: 0,
      });
    }
  }, [doc, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: DocumentFormData) => 
      doc ? documentApi.update(doc._id, data) : documentApi.create(propertyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['documents', propertyId] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Simulate cloud upload delay
    await new Promise(r => setTimeout(r, 800));
    
    // Mocked S3/R2 URL response
    const mockUrl = `https://cdn.vaultexp.com/properties/${propertyId}/${file.name.replace(/\\s+/g, '_')}`;

    setFormData(prev => ({
      ...prev,
      name: prev.name || file.name.split('.')[0], // Auto-fill name if empty
      fileUrl: mockUrl,
      mimeType: file.type,
      sizeBytes: file.size,
    }));

    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) return alert('Please upload a file or provide a URL.');
    
    const submitData = { ...formData };
    if (!submitData.expiresAt) delete submitData.expiresAt;

    mutation.mutate(submitData);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={doc ? 'Edit Document' : 'Upload Document'}
      description={doc ? 'Update existing document metadata.' : 'Securely upload financial records.'}
      icon={<FileText size={22} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* File Upload Area */}
        {!doc && (
          <div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/[0.1] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-vault-green/50 hover:bg-vault-green/[0.02] transition-colors"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-vault-green/30 border-t-vault-green rounded-full animate-spin" />
              ) : formData.fileUrl ? (
                <>
                  <FileText size={24} className="text-vault-green" />
                  <p className="text-[12px] font-bold text-vault-green">File Uploaded</p>
                </>
              ) : (
                <>
                  <UploadCloud size={24} className="text-gray-500" />
                  <p className="text-[12px] font-bold text-gray-400">Click to upload from Cloud</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Name & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
            <div className="relative">
              <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text" required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all capitalize"
            >
              {DOC_TYPES.map(c => <option key={c} value={c} className="bg-vault-dark">{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* URL (Manual override if needed) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">File URL</label>
          <div className="relative">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="url" required
              value={formData.fileUrl}
              onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-gray-400 focus:text-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Expiry Date (Optional)</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="date"
              value={formData.expiresAt}
              onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-[14px] text-white focus:border-vault-green/50 outline-none transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || uploading}
          className="w-full bg-vault-green text-black font-bold text-[14px] py-3.5 rounded-xl shadow-lg shadow-vault-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : doc ? 'Update Document' : 'Save Document'}
        </button>
      </form>
    </GlobalModal>
  );
}
