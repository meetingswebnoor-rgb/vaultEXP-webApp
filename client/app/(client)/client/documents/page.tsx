'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Folder, Eye, Lock } from 'lucide-react';
import { api } from '@/lib/api';

interface Document {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  aiSummary?: string;
  createdAt: string;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setDocuments([
        { id: '1', originalName: 'Master_Services_Agreement.pdf', fileType: 'pdf', fileSize: 1024500, aiSummary: 'This document is a Master Services Agreement outlining the scope of work, liability limits, and confidentiality terms between VaultEXP and the client.', createdAt: '2026-05-10T14:00:00Z' },
        { id: '2', originalName: 'Q1_Financial_Review.xlsx', fileType: 'xlsx', fileSize: 512000, createdAt: '2026-04-15T09:30:00Z' },
        { id: '3', originalName: 'Property_Deed_123_Main.pdf', fileType: 'pdf', fileSize: 2048000, aiSummary: 'Official property deed for 123 Main St. transferring ownership rights.', createdAt: '2026-03-20T11:15:00Z' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <FileText className="text-[var(--brand-primary,#2563EB)]" /> Shared Documents
        </h1>
        <p className="text-gray-500 mt-2">Securely access documents, contracts, and files shared with you.</p>
      </div>

      <div className="flex gap-8">
        {/* Document List */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Shared</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading documents...</td></tr>
              ) : documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-[var(--brand-primary)]">
                        {doc.fileType === 'pdf' ? <FileText size={18} /> : <Folder size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{doc.originalName}</div>
                        {doc.aiSummary && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-widest bg-purple-50 w-fit px-2 py-0.5 rounded">
                            <Sparkles size={10} /> AI Analyzed
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[var(--brand-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[var(--brand-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slide-out / Side Panel for AI Summary */}
        {selectedDoc && (
          <div className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hidden lg:block">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900">Document Info</h3>
              <Lock size={16} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">File Name</p>
                <p className="text-sm font-bold text-gray-900 break-words">{selectedDoc.originalName}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Security</p>
                <p className="text-sm text-gray-600 flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> End-to-End Encrypted</p>
              </div>

              {selectedDoc.aiSummary && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-purple-500" size={16} />
                    <p className="text-sm font-bold text-gray-900">Vault AI Summary</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    {selectedDoc.aiSummary}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';
