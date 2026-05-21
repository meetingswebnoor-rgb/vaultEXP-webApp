'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Palette, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId?: string;
}

const COLORS = [
  '#00FF88', // vault-green
  '#3B82F6', // blue
  '#A855F7', // purple
  '#F43F5E', // rose
  '#F59E0B', // amber
  '#64748B', // slate
];

export function CreateFolderModal({ isOpen, onClose, onSuccess, parentId }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const token = useAuthStore((s) => s.token);
  const { showToast } = useToast();

  const handleAiSuggest = () => {
    setIsAiSuggesting(true);
    // Simulate AI parsing context
    setTimeout(() => {
      setName('2026 Tax Documents');
      setSelectedColor(COLORS[3]);
      setIsAiSuggesting(false);
    }, 1200);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/folders`,
        { name, color: selectedColor, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.status === 201) {
        onSuccess();
        setName('');
        onClose();
        showToast('Smart folder created', 'success');
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create folder';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-vault-card border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-vault-green/10 text-vault-green border border-vault-green/20">
                  <Folder size={20} style={{ fill: `${selectedColor}40`, color: selectedColor }} />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">New Smart Folder</h2>
                  <p className="text-xs text-gray-500">Organize documents with custom tags</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {/* AI Auto-Suggest Button */}
              <button 
                onClick={handleAiSuggest}
                disabled={isAiSuggesting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-vault-green/30 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
              >
                <VaultAIOrb size={16} glow animated={isAiSuggesting} compact />
                {isAiSuggesting ? 'VaultAI is analyzing context...' : 'Auto-suggest folder name & color'}
              </button>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Folder Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Legal Contracts"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-vault-green outline-none transition-colors"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                  <Palette size={12} /> Color Label
                </label>
                <div className="flex items-center gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? 'white' : 'transparent',
                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {selectedColor === color && <CheckCircle2 size={14} className="text-black" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!name.trim() || isLoading}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-black bg-vault-green hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] disabled:shadow-none"
                >
                  {isLoading ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
