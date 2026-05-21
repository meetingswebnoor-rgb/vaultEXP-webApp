'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { AIBusinessAdvisor } from '@/components/business/AIBusinessAdvisor';

export default function BusinessAIInsightsPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/business');
        const list = res.data?.data?.businesses || [];
        setBusinesses(list);
        if (list.length > 0) setSelected(list[0]);
      } catch {
        setError('Failed to load your businesses.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mt-8">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      </PageContainer>
    );
  }

  if (businesses.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl"><Briefcase className="w-10 h-10 text-zinc-500" /></div>
          <p className="text-zinc-400 text-sm max-w-xs">
            You have no businesses yet. Add one to unlock the AI Business Advisor.
          </p>
          <button
            onClick={() => router.push('/business')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-semibold transition-colors"
          >
            Go to Businesses
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Business Advisor"
        description="VaultAI analyzes real data to surface revenue trends, cost savings, and strategic improvements."
      />

      {/* Business Selector */}
      {businesses.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {businesses.map((biz: any) => (
            <motion.button
              key={biz.id || biz._id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelected(biz)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selected?.id === (biz.id || biz._id)
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              {biz.name}
            </motion.button>
          ))}
        </div>
      )}

      {/* AI Advisor Panel */}
      {selected && (
        <AIBusinessAdvisor
          businessId={selected.id || selected._id}
          businessName={selected.name}
        />
      )}
    </PageContainer>
  );
}
