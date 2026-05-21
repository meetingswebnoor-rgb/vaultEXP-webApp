'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, Shield, FileText } from 'lucide-react';

export default function ClientUploadsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const requestedDocuments = [
    { id: 1, name: 'Proof of Identity (Passport or License)', required: true },
    { id: 2, name: 'Signed W-9 Form', required: true },
    { id: 3, name: 'Previous Year Tax Return', required: false },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload();
  };

  const handleUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <UploadCloud className="text-[var(--brand-primary,#2563EB)]" /> Secure Uploads
        </h1>
        <p className="text-gray-500 mt-2">End-to-end encrypted file drops directly into our secure vault.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <div 
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[400px] ${
              isDragging ? 'border-[var(--brand-primary)] bg-blue-50/50' : 'border-gray-300 bg-white hover:border-[var(--brand-primary)] hover:bg-gray-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadStatus === 'idle' && (
              <>
                <div className="w-20 h-20 bg-blue-50 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & Drop files here</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-sm">
                  Files are automatically encrypted before leaving your browser. Maximum file size: 50MB.
                </p>
                <button className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-sm hover:bg-gray-800 transition-colors">
                  Browse Files
                </button>
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin mb-6" />
                <h3 className="text-lg font-bold text-gray-900">Encrypting & Uploading...</h3>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Complete!</h3>
                <p className="text-sm text-gray-500 mt-2">Your files have been securely vaulted.</p>
              </div>
            )}
          </div>
        </div>

        {/* Requested Documents Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" /> Action Required
            </h3>
            <p className="text-xs text-gray-500 mb-6">Your account manager has requested the following documents:</p>
            
            <div className="space-y-3">
              {requestedDocuments.map(doc => (
                <div key={doc.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${doc.required ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {doc.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
            <Shield className="text-blue-400 mb-4" size={24} />
            <h3 className="text-base font-bold mb-2">Bank-Grade Security</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              All files are encrypted with AES-256 before transmission and stored securely in isolated tenant vaults. Only authorized personnel can access your uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
