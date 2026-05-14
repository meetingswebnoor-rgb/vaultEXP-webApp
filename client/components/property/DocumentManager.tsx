'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, ExternalLink, Download, FileText } from 'lucide-react';
import { documentApi, PropertyDocument } from '@/features/property/documentApi';
import { DocumentModal } from './DocumentModal';
import { motion } from 'framer-motion';

const DOC_ICONS: Record<string, string> = {
  lease_agreement: '📄', insurance: '🛡️', mortgage: '🏦',
  title_deed: '🏛️', tax_certificate: '🧾', inspection_report: '🔍', other: '📁',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DocumentManager({ propertyId }: { propertyId: string }) {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PropertyDocument | undefined>();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', propertyId],
    queryFn: () => documentApi.list(propertyId),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => documentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['documents', propertyId] });
    },
  });

  const handleEdit = (d: PropertyDocument) => {
    setEditingDoc(d);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDoc(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-vault-green/20 border-t-vault-green rounded-full animate-spin" /></div>;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/[0.07] rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <FileText size={22} className="text-gray-600" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-gray-500">No documents uploaded</p>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[12px] font-semibold hover:bg-blue-500/20 transition-colors">
          <Plus size={13} /> Upload Document
        </button>
        <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} propertyId={propertyId} doc={editingDoc} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{documents.length} Files</p>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white text-[12px] font-semibold transition-all">
          <Plus size={14} /> Upload
        </button>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, i) => (
          <motion.div
            key={doc._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mb-4 text-[22px]">
              {DOC_ICONS[doc.type] ?? '📁'}
            </div>
            
            <p className="text-[13px] font-semibold text-white leading-tight mb-1 truncate">{doc.name}</p>
            <p className="text-[11px] text-gray-500 capitalize mb-3">{doc.type.replace(/_/g, ' ')}</p>
            
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-600">{fmtDate(doc.uploadedAt)}</p>
              {doc.expiresAt && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 uppercase">
                  Exp: {fmtDate(doc.expiresAt)}
                </span>
              )}
            </div>

            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(doc)} className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors">
                <Edit3 size={14} />
              </button>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors">
                <ExternalLink size={14} />
              </a>
              <button onClick={() => deleteMut.mutate(doc._id)} disabled={deleteMut.isPending} className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} propertyId={propertyId} doc={editingDoc} />
    </div>
  );
}
