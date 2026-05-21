'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, FileText, Clock, X, SlidersHorizontal, ChevronRight, Tag } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

interface SearchResult {
  id: string;
  originalName: string;
  category: string;
  aiSummary: string;
  business?: { name: string };
  createdAt: string;
}

export function IntelligentSearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Tax Return 2025', 'Lease Agreement', 'Invoice #1042']);
  
  const token = useAuthStore((s) => s.token);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/documents/search', {
          params: { q: query, limit: 5 },
        });
        setResults(res.data.documents || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-4xl z-50">
      {/* Search Input */}
      <div className={cn(
        "relative flex items-center w-full px-4 py-3 rounded-2xl border transition-all duration-300",
        isFocused 
          ? "bg-vault-dark border-vault-green shadow-[0_0_20px_rgba(0,255,136,0.15)]" 
          : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
      )}>
        <Search className={cn("shrink-0 transition-colors duration-300", isFocused ? "text-vault-green" : "text-gray-500")} size={18} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search by filename, OCR text, AI summary, or invoice amount..."
          className="w-full bg-transparent border-none outline-none text-white px-3 text-[14px] placeholder-gray-500 font-medium"
        />

        <div className="flex items-center gap-2 shrink-0">
          {isLoading && <Loader2 className="animate-spin text-vault-green" size={16} />}
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
          <button className="p-1.5 ml-1 rounded-lg bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isFocused && (query.trim().length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0A0F14]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* If no query, show Recents & Filters */}
            {!query.trim() && (
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={12} /> Recent Searches
                </p>
                <div className="space-y-1">
                  {recentSearches.map((term, i) => (
                    <button 
                      key={i} 
                      onClick={() => setQuery(term)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-white/[0.04] hover:text-vault-green transition-colors group"
                    >
                      <span className="font-medium">{term}</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Search Results */}
            {query.trim() && (
              <div className="p-2">
                {results.length === 0 && !isLoading ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 text-sm">No intelligent matches found for &quot;{query}&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((doc) => (
                      <button 
                        key={doc.id}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all text-left group"
                      >
                        <div className="mt-0.5 p-2 rounded-lg bg-vault-green/10 text-vault-green shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-vault-green transition-colors">
                            {doc.originalName}
                          </h4>
                          {doc.aiSummary && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {doc.aiSummary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-white/[0.05] px-1.5 py-0.5 rounded">
                              {doc.category || 'DOCUMENT'}
                            </span>
                            {doc.business && (
                              <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                <Tag size={10} /> {doc.business.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Filters Footer */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.05] flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">AI Filters:</span>
              {['Invoices > $1000', 'Signed Contracts', 'Q4 Taxes', 'Upcoming Deadlines'].map(f => (
                <button key={f} className="shrink-0 px-2 py-1 rounded-md bg-white/[0.03] hover:bg-vault-green/10 border border-white/[0.05] hover:border-vault-green/30 text-[10px] text-gray-400 hover:text-vault-green transition-colors whitespace-nowrap">
                  {f}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
