'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FileText, Search, Filter, LayoutGrid, List, UploadCloud,
  MoreVertical, File, Image as ImageIcon, FileSpreadsheet, Download,
  Trash2, Eye, Plus, BrainCircuit, X, ChevronRight, ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils/cn';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { FileUpload } from '@/components/ui/FileUpload';
import { IntelligentSearchBar } from '@/components/documents/IntelligentSearchBar';
import { DocumentPreviewModal } from '@/components/documents/DocumentPreviewModal';
import { CreateFolderModal } from '@/components/documents/CreateFolderModal';
import { DocumentChatModal } from '@/components/documents/DocumentChatModal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';

// ── Types ──────────────────────────────────────────────────────────────────
interface Doc {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  category: string | null;
  folderId: string | null;
  aiSummary: string | null;
  aiAnalysis?: {
    confidence: number;
  };
}

interface DocFolder {
  id: string;
  name: string;
  color: string;
  _count?: {
    documents: number;
  };
}

const CATEGORIES = [
  { id: 'tax-return',     label: 'Tax Returns' },
  { id: 'legal-contract', label: 'Legal Contracts' },
  { id: 'property',       label: 'Properties' },
  { id: 'lease',          label: 'Lease' },
  { id: 'invoice',        label: 'Invoices' },
];

// ── Sub-components ──────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: string }) {
  const t = type?.toLowerCase();
  if (t === 'pdf')   return <FileText className="text-red-400" size={24} />;
  if (t === 'xlsx' || t === 'csv')  return <FileSpreadsheet className="text-green-400" size={24} />;
  if (['png', 'jpg', 'jpeg'].includes(t)) return <ImageIcon className="text-blue-400" size={24} />;
  return <File className="text-gray-400" size={24} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 animate-pulse space-y-3">
      <div className="h-16 w-16 rounded-xl bg-white/[0.05]" />
      <div className="h-4 w-3/4 rounded bg-white/[0.05]" />
      <div className="h-3 w-1/2 rounded bg-white/[0.03]" />
    </div>
  );
}

function EmptyState({ label, onClear }: { label: string; onClear?: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <VaultAIOrb size={64} glow={false} className="opacity-10" />
        <Folder className="absolute inset-0 m-auto text-gray-700" size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2">No documents found</h3>
      <p className="text-gray-500 max-w-xs mb-6 text-sm">
        We couldn&apos;t find any documents in <span className="text-vault-green font-semibold">{label}</span>. 
        Try uploading a new file or clearing your filters.
      </p>
      {onClear && (
        <button 
          onClick={onClear}
          className="px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function DocumentVault() {
  const { isDesktop } = useBreakpoint();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const { showToast } = useToast();

  // Filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  const mappedPreviewDoc = useMemo(() => {
    if (!previewDoc) return null;
    return {
      id: previewDoc.id,
      name: previewDoc.originalName,
      type: previewDoc.fileType,
      url: `${API_URL}/documents/download/${previewDoc.id}`,
      aiSummary: previewDoc.aiSummary || undefined,
      aiKeywords: undefined,
      extractedText: undefined,
      confidenceScore: previewDoc.aiAnalysis?.confidence || 95,
      riskFlags: []
    };
  }, [previewDoc, API_URL]);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: documents = [], isLoading: docsLoading } = useQuery<Doc[]>({
    queryKey: ['documents', activeCategory, activeFolder, searchQuery],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/documents/search`, {
        params: { 
          type: activeCategory, 
          folderId: activeFolder,
          q: searchQuery
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.documents;
    },
    enabled: !!token
  });

  const { data: folders = [] } = useQuery<DocFolder[]>({
    queryKey: ['document-folders'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/documents/folders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.folders;
    },
    enabled: !!token
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.put(`${API_URL}/documents/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showToast('Document archived');
      if (selectedDoc) setSelectedDoc(null);
    }
  });

  // ── Derived State ────────────────────────────────────────────────────────
  const filterLabel = useMemo(() => {
    if (activeCategory) return CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory;
    if (activeFolder) return folders.find(f => f.id === activeFolder)?.name || 'Folder';
    return 'All Files';
  }, [activeCategory, activeFolder, folders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleArchive = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to archive this document?')) {
      archiveMutation.mutate(id);
    }
  }, [archiveMutation]);

  const handleUploadSuccess = useCallback(() => {
    setShowUpload(false);
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    showToast('Documents uploaded and processing');
  }, [queryClient, showToast]);

  const handleClearFilters = () => {
    setActiveCategory(null);
    setActiveFolder(null);
    setSearchQuery('');
  };

  // ── Document Card Component ──────────────────────────────────────────────
  const DocumentCard = useCallback(({ doc }: { doc: Doc }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden',
        'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-vault-green/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]',
        selectedDoc?.id === doc.id && 'border-vault-green/40 bg-vault-green/5 ring-1 ring-vault-green/20',
        viewMode === 'list' ? 'flex-row items-center p-4 gap-4' : 'p-5 gap-3'
      )}
      onClick={() => setSelectedDoc(doc)}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 shrink-0 transition-transform group-hover:scale-105',
        viewMode === 'list' ? 'h-12 w-12' : 'h-16 w-16 mb-2'
      )}>
        <TypeIcon type={doc.fileType} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-vault-green transition-colors">
          {doc.originalName}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-medium text-gray-500">
            {new Date(doc.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] text-gray-700">•</span>
          <span className="text-[10px] font-medium text-gray-500 uppercase">
            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>

      {viewMode === 'grid' && doc.aiSummary && (
        <div className="mt-3 pt-3 border-t border-white/[0.05]">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-full bg-vault-green/10">
              <VaultAIOrb size={12} compact glow={false} />
            </div>
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed italic">
              &quot;{doc.aiSummary}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Hover Actions */}
      <div className={cn(
        'flex items-center gap-1.5',
        viewMode === 'grid'
          ? 'absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300'
          : 'opacity-0 group-hover:opacity-100 transition-opacity ml-auto'
      )}>
        <button 
          onClick={e => { e.stopPropagation(); setPreviewDoc(doc); }}
          className="p-2 rounded-xl bg-black/60 hover:bg-vault-green/20 text-gray-400 hover:text-vault-green backdrop-blur-md border border-white/5 transition-all shadow-lg"
        >
          <Eye size={14} />
        </button>
        <button 
          onClick={e => handleArchive(doc.id, e)}
          className="p-2 rounded-xl bg-black/60 hover:bg-red-500/20 text-gray-400 hover:text-red-400 backdrop-blur-md border border-white/5 transition-all shadow-lg"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  ), [viewMode, selectedDoc, handleArchive]);

  // ── AI PANEL ─────────────────────────────────────────────────────────────
  const AIPanel = () => (
    <aside className={cn(
      "shrink-0 border-l border-vault-border/60 bg-vault-card flex flex-col transition-all duration-500 ease-in-out overflow-hidden",
      rightPanelOpen ? "w-80" : "w-0 opacity-0"
    )}>
      <div className="p-6 border-b border-vault-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VaultAIOrb size={32} glow animated compact />
          <div>
            <h3 className="font-display font-bold text-white leading-tight">VaultAI</h3>
            <p className="text-[10px] text-vault-green uppercase tracking-widest font-bold">Intelligent Scan</p>
          </div>
        </div>
        <button onClick={() => setRightPanelOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!selectedDoc ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-4">
            <BrainCircuit size={48} className="mb-4 text-gray-600" />
            <p className="text-sm text-gray-400 font-medium">Select a document to unlock deep AI insights and automated extraction.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <BrainCircuit size={40} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Executive Summary</p>
              <p className="text-sm text-gray-200 leading-relaxed font-medium">
                {selectedDoc.aiSummary || 'Document currently being analyzed by VaultAI. This usually takes 10-30 seconds depending on file size.'}
              </p>
            </div>

            {selectedDoc.aiAnalysis?.confidence && (
              <div className="p-4 rounded-2xl bg-vault-green/5 border border-vault-green/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-vault-green uppercase tracking-widest">Confidence Score</span>
                  <span className="text-sm font-bold text-white">{selectedDoc.aiAnalysis.confidence}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${selectedDoc.aiAnalysis.confidence}%` }}
                    className="h-full bg-vault-green rounded-full shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">AI Actions</p>
              <button 
                onClick={() => setShowChat(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-vault-green text-black font-bold hover:brightness-110 transition-all shadow-lg hover:shadow-vault-green/20"
              >
                <BrainCircuit size={18} />
                Ask Document
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/[0.05] transition-all">
                <Download size={18} />
                Export Data
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </aside>
  );

  // ── DESKTOP LAYOUT ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="h-full flex overflow-hidden bg-vault-darker font-sans">
        {/* LEFT SIDEBAR (Expanded width for premium feel) */}
        <aside className="w-[280px] shrink-0 border-r border-vault-border/60 bg-vault-dark flex flex-col">
          <div className="p-6">
            <button
              onClick={() => setShowUpload(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-vault-green text-black font-bold hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(0,255,136,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud size={20} />
              Upload Document
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-10 custom-scrollbar">
            {/* Categories Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Global Filters</p>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveCategory(null); setActiveFolder(null); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium',
                    (!activeCategory && !activeFolder)
                      ? 'bg-vault-green/10 text-vault-green shadow-inner border border-vault-green/20'
                      : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                  )}
                >
                  <LayoutGrid size={18} className={(!activeCategory && !activeFolder) ? 'text-vault-green' : ''} />
                  All Documents
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setActiveFolder(null); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium',
                      activeCategory === cat.id
                        ? 'bg-vault-green/10 text-vault-green border border-vault-green/20'
                        : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full", activeCategory === cat.id ? "bg-vault-green" : "bg-gray-700")} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Folders Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Smart Folders</p>
                <button onClick={() => setShowCreateFolder(true)} className="p-1 text-gray-500 hover:text-vault-green transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {folders.length === 0 ? (
                  <div className="px-4 py-6 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">Organize by property, entity, or custom tags.</p>
                    <button 
                      onClick={() => setShowCreateFolder(true)}
                      className="text-[11px] text-vault-green font-bold hover:underline"
                    >
                      + Create Folder
                    </button>
                  </div>
                ) : (
                  folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFolder(f.id); setActiveCategory(null); }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-medium',
                        activeFolder === f.id
                          ? 'bg-vault-green/10 text-vault-green border border-vault-green/20'
                          : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Folder size={18} style={{ color: f.color }} className={activeFolder === f.id ? "fill-current opacity-20" : ""} />
                        {f.name}
                      </div>
                      <span className="text-[10px] font-bold bg-white/[0.05] px-2 py-0.5 rounded-full text-gray-500">
                        {f._count?.documents || 0}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CENTER AREA (Expandable) */}
        <main className="flex-1 flex flex-col bg-vault-dark overflow-hidden relative">
          <header className="flex items-center gap-6 p-6 border-b border-vault-border/40 shrink-0 bg-vault-dark/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex-1">
              <IntelligentSearchBar />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300",
                  rightPanelOpen ? "bg-vault-green/10 border-vault-green/30 text-vault-green" : "border-white/5 text-gray-500 hover:text-white hover:bg-white/5"
                )}
              >
                <BrainCircuit size={20} />
              </button>
              <div className="h-8 w-[1px] bg-white/10 mx-1" />
              <div className="flex items-center rounded-xl border border-white/10 p-1.5 bg-black/20">
                <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white')}>
                  <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white')}>
                  <List size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {showUpload ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto py-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-display font-extrabold text-white mb-2">
                      {activeCategory ? `Upload to ${CATEGORIES.find(c => c.id === activeCategory)?.label}` : 'Secure Upload'}
                    </h2>
                    <p className="text-gray-500 font-medium">Files are encrypted and scanned by VaultAI automatically.</p>
                  </div>
                  <button onClick={() => setShowUpload(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-vault-green hover:bg-vault-green/10 transition-all border border-vault-green/20">Cancel</button>
                </div>
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess} 
                  context={{ 
                    category: activeCategory || undefined,
                    folderId: activeFolder || undefined
                  }}
                />
              </motion.div>
            ) : (
              <div className="w-full">
                {/* View Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-display font-extrabold text-white capitalize tracking-tight">{filterLabel}</h2>
                        <span className="px-3 py-1 rounded-full bg-white/[0.05] text-gray-500 text-[11px] font-bold border border-white/5">
                          {documents.length} Items
                        </span>
                      </div>
                      {activeCategory && (
                        <p className="text-xs text-gray-500 mt-1 font-medium italic">
                          AI auto-categorization active for {filterLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {activeCategory && (
                      <button 
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vault-green/10 text-vault-green border border-vault-green/20 text-sm font-bold hover:bg-vault-green/20 transition-all"
                      >
                        <Plus size={16} />
                        Add {filterLabel}
                      </button>
                    )}
                    {(activeCategory || activeFolder || searchQuery) && (
                      <button 
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-gray-500 hover:text-vault-green flex items-center gap-1.5 transition-colors"
                      >
                        <X size={14} /> Clear All
                      </button>
                    )}
                  </div>
                </div>

                <motion.div
                  layout
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid' 
                      ? (rightPanelOpen ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5') 
                      : 'grid-cols-1'
                  )}
                >
                  {docsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                  ) : documents.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                      <div className="relative mb-6">
                        <VaultAIOrb size={80} glow={false} className="opacity-10" />
                        <UploadCloud className="absolute inset-0 m-auto text-gray-700" size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-2">No documents in {filterLabel}</h3>
                      <p className="text-gray-500 max-w-xs mb-8 text-sm">
                        Start organizing your vault by uploading your first {filterLabel.toLowerCase()} document.
                      </p>
                      <button 
                        onClick={() => setShowUpload(true)}
                        className="px-8 py-3.5 rounded-2xl bg-vault-green text-black font-bold hover:brightness-110 transition-all shadow-xl shadow-vault-green/10 flex items-center gap-2"
                      >
                        <UploadCloud size={20} />
                        Upload {filterLabel}
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {documents.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                    </AnimatePresence>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </main>

        <AIPanel />

        {/* Modals */}
        <DocumentPreviewModal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} document={mappedPreviewDoc} />
        <CreateFolderModal 
          isOpen={showCreateFolder} 
          onClose={() => setShowCreateFolder(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['document-folders'] });
          }} 
        />
        <DocumentChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          documentIds={selectedDoc ? [selectedDoc.id] : []}
          documentNames={selectedDoc ? [selectedDoc.originalName] : []}
        />
      </div>
    );
  }

  // ── MOBILE LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-vault-darker relative overflow-hidden font-sans">
      <header className="px-5 py-5 border-b border-white/5 sticky top-0 bg-vault-dark/95 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Vault</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreateFolder(true)} className="p-2 rounded-xl bg-white/5 text-gray-400"><Plus size={20} /></button>
            <VaultAIOrb size={28} glow animated compact />
          </div>
        </div>
        <div className="w-full">
          <IntelligentSearchBar />
        </div>
        
        {/* Mobile Horizontal Tabs */}
        <div className="flex gap-2.5 overflow-x-auto mt-4 pb-1 no-scrollbar">
          <button
            onClick={() => { setActiveCategory(null); setActiveFolder(null); }}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
              (!activeCategory && !activeFolder)
                ? 'bg-vault-green text-black border-vault-green shadow-lg shadow-vault-green/20'
                : 'bg-white/[0.04] border-white/10 text-gray-400'
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setActiveFolder(null); }}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                activeCategory === cat.id
                  ? 'bg-vault-green text-black border-vault-green shadow-lg shadow-vault-green/20'
                  : 'bg-white/[0.04] border-white/10 text-gray-400'
              )}
            >
              {cat.label}
            </button>
          ))}
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFolder(f.id); setActiveCategory(null); }}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2',
                activeFolder === f.id
                  ? 'bg-vault-green text-black border-vault-green shadow-lg shadow-vault-green/20'
                  : 'bg-white/[0.04] border-white/10 text-gray-400'
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
              {f.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32 custom-scrollbar">
        {showUpload ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload</h2>
              <button onClick={() => setShowUpload(false)} className="text-vault-green text-sm font-bold">Cancel</button>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </motion.div>
        ) : docsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState label={filterLabel} onClear={handleClearFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map(doc => (
              <motion.div
                key={doc.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedDoc(doc); setPreviewDoc(doc); }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-vault-card border border-white/[0.05] relative overflow-hidden active:bg-white/[0.08] transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <TypeIcon type={doc.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{doc.originalName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-700">•</span>
                    <span className="text-[10px] text-gray-500 font-medium">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.aiSummary && (
                    <div className="p-1.5 rounded-full bg-vault-green/10 text-vault-green">
                      <BrainCircuit size={14} />
                    </div>
                  )}
                  <button className="p-1 text-gray-600"><ChevronRight size={18} /></button>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-vault-green shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!showUpload && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowUpload(true)}
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-vault-green text-black shadow-[0_8px_30px_rgba(0,255,136,0.4)] flex items-center justify-center z-30 scale-110"
        >
          <Plus size={28} strokeWidth={3} />
        </motion.button>
      )}

      {/* Shared Modals */}
      <DocumentPreviewModal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} document={mappedPreviewDoc} />
      <CreateFolderModal 
        isOpen={showCreateFolder} 
        onClose={() => setShowCreateFolder(false)} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['document-folders'] });
        }} 
      />
      <DocumentChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        documentIds={selectedDoc ? [selectedDoc.id] : []}
        documentNames={selectedDoc ? [selectedDoc.originalName] : []}
      />
    </div>
  );
}
