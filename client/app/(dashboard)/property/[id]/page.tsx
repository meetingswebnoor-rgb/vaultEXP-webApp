'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PropertyDashboard } from '@/components/mobile/property/PropertyDashboard';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActionStore } from '@/store/actionStore';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { openAction } = useActionStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await api.get(`/property/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-vault-darker">
      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3 backdrop-blur-xl border-b border-white/[0.05]"
           style={{ background: 'rgba(5,5,10,0.85)' }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 active:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h2 className="text-[16px] font-semibold text-white truncate">
            {data?.name ?? 'Property'}
          </h2>
        </div>
      </div>

      {/* ── Dashboard ───────────────────────────────────────────── */}
      <PropertyDashboard
        property={data}
        isLoading={isLoading}
        error={error ? 'Failed to load property details.' : null}
        onAddTenant={() => {/* TODO: open tenant modal */}}
        onAddExpense={() => openAction('expense')}
        onUploadDocument={() => openAction('document')}
      />
    </div>
  );
}
