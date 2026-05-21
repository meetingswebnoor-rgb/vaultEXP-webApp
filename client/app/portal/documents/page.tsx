'use client';
import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';

export default function PortalDocuments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Secure Documents</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-vault-green text-black font-bold rounded-xl hover:bg-vault-green/90 transition-all">
          <Upload size={16} /> Upload File
        </button>
      </div>
      
      <div className="p-16 border-2 border-dashed border-white/10 bg-white/[0.01] rounded-2xl text-center">
        <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No documents shared yet</h3>
        <p className="text-gray-400 text-sm">When documents are shared with you by your host, they will appear here.</p>
      </div>
    </div>
  );
}
