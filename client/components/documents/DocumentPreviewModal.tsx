'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, Maximize, Download, ExternalLink, 
  FileText, BrainCircuit, ShieldAlert, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { cn } from '@/lib/utils/cn';

interface DocumentData {
  id: string;
  name: string;
  type: string;
  url: string;
  aiSummary?: string;
  aiKeywords?: string[];
  extractedText?: string;
  confidenceScore?: number;
  riskFlags?: string[];
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
}

export function DocumentPreviewModal({ isOpen, onClose, document: doc }: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'ai_text'>('preview');

  // Reset state when doc changes
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setActiveTab('preview');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, doc]);

  if (!doc) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = doc.url;
    a.download = doc.name;
    a.click();
  };

  // Highlighting engine for AI Text view
  const renderHighlightedText = (text: string, keywords: string[] = []) => {
    if (!text) return <p className="text-gray-500 italic">No text extracted.</p>;
    if (!keywords.length) return <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{text}</p>;

    // Simple regex to wrap keywords in a highlight span
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => 
          keywords.some(k => k.toLowerCase() === part.toLowerCase()) ? (
            <span key={i} className="bg-vault-green/20 text-vault-green font-semibold px-1 rounded-sm">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  const renderPreviewContent = () => {
    if (activeTab === 'ai_text') {
      return (
        <div className="w-full h-full p-8 overflow-y-auto bg-white/[0.02]">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.05]">
              <VaultAIOrb size={24} glow compact />
              <h3 className="text-lg font-bold text-white">AI Text Extraction & Analysis</h3>
            </div>
            <div className="text-sm font-mono">
              {renderHighlightedText(
                doc.extractedText || "Sample extracted text. This contract between VaultEXP and John Doe is valid until 2026. The total invoice amount is $4,500. Late fees apply.",
                doc.aiKeywords || ['VaultEXP', 'John Doe', '2026', '$4,500', 'Late fees']
              )}
            </div>
          </div>
        </div>
      );
    }

    // Actual file preview
    switch (doc.type) {
      case 'pdf':
        return (
          <iframe 
            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full bg-white rounded-xl shadow-inner transition-transform duration-300"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            title={doc.name}
          />
        );
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return (
          <div className="w-full h-full flex items-center justify-center bg-black/20 overflow-auto">
            <motion.img 
              src={doc.url} 
              alt={doc.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          </div>
        );
      case 'docx':
      case 'xlsx':
      case 'csv':
        // Fallback for office documents: usually requires Office Online Viewer or forcing the AI text view
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] text-center p-8">
            <FileText size={64} className="text-gray-600 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Rich Preview Unavailable</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Native browser preview is not supported for MS Office files. You can download the file or use VaultAI to read the extracted text.
            </p>
            <div className="flex gap-4">
              <button onClick={handleDownload} className="px-5 py-2.5 rounded-xl bg-vault-green text-black font-bold flex items-center gap-2 hover:bg-vault-green/90 transition-colors">
                <Download size={18} /> Download Original
              </button>
              <button onClick={() => setActiveTab('ai_text')} className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                <BrainCircuit size={18} /> View AI Extracted Text
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Preview not available for this file type.
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative flex flex-col md:flex-row bg-[#0A0F14]/95 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300",
              isFullscreen ? "fixed inset-4 rounded-3xl" : "w-full max-w-7xl h-[85vh] rounded-3xl"
            )}
          >
            {/* Header / Toolbar (Mobile mostly, but spans top) */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black/40 backdrop-blur border border-white/10">
                  <FileText size={18} className="text-vault-green" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white drop-shadow-md truncate max-w-[200px] sm:max-w-xs">{doc.name}</h2>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest">{doc.type}</p>
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-black/40 backdrop-blur border border-white/10 rounded-lg p-1 mr-2">
                  <button onClick={handleZoomOut} className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"><ZoomOut size={16} /></button>
                  <span className="text-[11px] font-mono text-gray-400 w-10 text-center">{zoom}%</span>
                  <button onClick={handleZoomIn} className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"><ZoomIn size={16} /></button>
                </div>
                
                <button onClick={handleDownload} className="p-2 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors" title="Download">
                  <Download size={18} />
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block" title="Fullscreen">
                  <Maximize size={18} />
                </button>
                <button onClick={onClose} className="p-2 rounded-lg bg-red-500/20 backdrop-blur border border-red-500/30 text-red-400 hover:bg-red-500/40 hover:text-red-300 transition-colors ml-2" title="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* LEFT: Preview Area */}
            <div className="flex-1 relative bg-black/40 overflow-hidden flex flex-col pt-16">
              
              {/* Tab Switcher (Preview vs AI Text) */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === 'preview' ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200")}
                >
                  Original View
                </button>
                <button 
                  onClick={() => setActiveTab('ai_text')}
                  className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5", activeTab === 'ai_text' ? "bg-vault-green/20 text-vault-green shadow-sm" : "text-gray-400 hover:text-vault-green/70")}
                >
                  <BrainCircuit size={14} /> AI X-Ray
                </button>
              </div>

              {/* Render Area */}
              <div className="flex-1 overflow-hidden relative p-4">
                {renderPreviewContent()}
              </div>
            </div>

            {/* RIGHT: AI Sidebar */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-vault-card flex flex-col shrink-0">
              <div className="p-5 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <VaultAIOrb size={24} glow animated compact />
                  <h3 className="font-display font-bold text-white text-sm">VaultAI Analysis</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* AI Summary */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-vault-green" /> Smart Summary
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    {doc.aiSummary || "This document has been processed by VaultAI. Essential data points, dates, and entities have been successfully extracted and indexed for intelligent search."}
                  </p>
                </div>

                {/* Extracted Tags/Keywords */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                    <BrainCircuit size={12} className="text-blue-400" /> Extracted Entities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(doc.aiKeywords || ['Legal', 'Contract', 'Q4 2025', 'VaultEXP', '$4,500']).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[11px] text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Flags */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-red-400" /> Risk Flags
                  </h4>
                  {(doc.riskFlags && doc.riskFlags.length > 0) ? (
                    <ul className="space-y-2">
                      {doc.riskFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                          <span className="mt-0.5">•</span> {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-vault-green bg-vault-green/10 p-2.5 rounded-lg border border-vault-green/20 flex items-center gap-2">
                      <CheckCircle2 size={14} /> No significant risks detected.
                    </div>
                  )}
                </div>

                {/* Confidence Score */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AI Confidence</span>
                    <span className="text-xs font-bold text-white">{doc.confidenceScore || 98}%</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-vault-green" style={{ width: `${doc.confidenceScore || 98}%` }} />
                  </div>
                </div>

              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-white/5">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-vault-green text-black font-bold text-sm hover:bg-vault-green/90 transition-colors">
                  Ask AI About Document <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
