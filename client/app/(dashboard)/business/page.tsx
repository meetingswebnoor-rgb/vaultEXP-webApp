'use client';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase, Plus, AlertCircle } from 'lucide-react';
import { useActionStore } from '@/store/actionStore';
import { BusinessListCard } from '@/components/mobile/business/BusinessListCard';
import { DesktopBusinessLayout } from '@/components/desktop/business/DesktopBusinessLayout';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/features/wallet/api/walletApi';
import { Loader2 } from 'lucide-react';

export default function BusinessPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const { openAction } = useActionStore();

  const { data: businesses = [], isLoading, isError, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: walletApi.getBusinesses,
    retry: 1,
  });

  const hasBusinesses = businesses.length > 0;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mt-8">
          <AlertCircle size={20} />
          <span className="text-sm">Failed to load businesses. Please try again.</span>
        </div>
      </PageContainer>
    );
  }

  // Desktop View
  if (!isMobile && !isTablet && hasBusinesses) {
    return <DesktopBusinessLayout businesses={businesses} />;
  }

  // Mobile/Tablet View
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Businesses"
          description="Manage your business entities and operations."
        />
        {hasBusinesses && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => openAction('business')}
            className="w-10 h-10 rounded-full bg-vault-green flex items-center justify-center text-black shadow-lg shadow-vault-green/20"
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      {!hasBusinesses ? (
        <EmptyState
          title="Start by adding your first business"
          description="Track valuation, profits, and operations in your executive vault."
          actionLabel="Add Business"
          onAction={() => openAction('business')}
          icon={Briefcase}
          className="mt-8"
        />
      ) : (
        <div className="mt-6 space-y-4">
          {businesses.map((biz: any) => (
            <BusinessListCard
              key={biz._id}
              id={biz._id}
              name={biz.name}
              type={biz.type}
              revenue={biz.metadata?.valuation ? `$${biz.metadata.valuation.toLocaleString()}` : '$0'}
              expenses={'$0'}
              color={biz.status === 'active' ? '#00FF88' : '#6B7280'}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
