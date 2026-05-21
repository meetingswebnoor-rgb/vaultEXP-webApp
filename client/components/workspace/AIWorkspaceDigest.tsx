'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AIWorkspaceDigest({ workspaceId }: { workspaceId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/ai-summary`);
      setSummary(res.data.data.summary);
    } catch (err) {
      console.error(err);
      setSummary('Failed to generate summary. Ensure documents are text-readable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-vault-card border border-white/5 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/5 bg-vault-darker/50 flex items-center gap-2">
        <Sparkles size={18} className="text-purple-400" />
        <h3 className="font-bold text-white text-sm">AI Workspace Digest</h3>
      </div>
      <div className="p-5">
        {summary ? (
          <div className="text-sm text-gray-300 leading-relaxed bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
            {summary}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-4">Click below to aggregate and summarize all text documents in this workspace.</p>
            <button 
              onClick={generate} 
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all border border-white/10 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate Digest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
