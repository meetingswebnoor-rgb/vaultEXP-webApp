'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PropertyListCard } from '@/components/mobile/property/PropertyListCard';
import { DesktopPropertyLayout } from '@/components/desktop/property/DesktopPropertyLayout';
import { PropertyEmptyState } from '@/components/property/PropertyEmptyState';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Loader2, Building2, Plus, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertySummary {
  _id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  currentValue: number;
  purchaseValue: number;
  appreciation: number;
  tenantCount: number;
}

interface PropertyListResponse {
  properties: PropertySummary[];
  total: number;
  portfolioValue?: number;
}

export default function PropertyPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<PropertyListResponse>({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get('/api/property');
      return res.data.data;
    },
    retry: 1,
  });

  const { data: statsData } = useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const res = await api.get('/api/property/stats');
      return res.data.data;
    },
    retry: 1,
  });

  const properties = data?.properties ?? [];
  const hasProperties = properties.length > 0;

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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mt-8">
          <AlertCircle size={18} />
          <span className="text-sm">Failed to load properties. Please try again.</span>
        </div>
      </PageContainer>
    );
  }

  const handleAdd = () => setIsAddModalOpen(true);

  // ── Desktop: split-pane layout ───────────────────────────────
  if (!isMobile && !isTablet && hasProperties) {
    return (
      <>
        <DesktopPropertyLayout properties={properties} stats={statsData} onAdd={handleAdd} />
        <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </>
    );
  }

  return (
    <PageContainer>
      {/* Add Property Modal */}
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          title="Properties"
          description="Track and manage your real estate portfolio."
        />
        {hasProperties && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-vault-green flex items-center justify-center text-black shadow-lg shadow-vault-green/20 flex-shrink-0"
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      {/* Portfolio Stats Bar */}
      {hasProperties && statsData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              icon: Building2,
              label: 'Properties',
              value: statsData.propertyCount,
              color: '#3B82F6',
            },
            {
              icon: DollarSign,
              label: 'Portfolio',
              value: statsData.portfolioValue >= 1_000_000
                ? `$${(statsData.portfolioValue / 1_000_000).toFixed(1)}M`
                : `$${(statsData.portfolioValue / 1_000).toFixed(0)}K`,
              color: '#00FF88',
            },
            {
              icon: TrendingUp,
              label: 'Gain',
              value: `${statsData.appreciation}%`,
              color: statsData.appreciation >= 0 ? '#00FF88' : '#EF4444',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-3.5 border border-white/[0.07] bg-white/[0.03] text-center"
            >
              <div
                className="w-7 h-7 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}25` }}
              >
                <Icon size={13} style={{ color }} strokeWidth={2} />
              </div>
              <p className="text-[14px] font-bold text-white font-display">{value}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty state or list */}
      {!hasProperties ? (
        <PropertyEmptyState onAdd={handleAdd} />
      ) : (
        /* Property cards list (Mobile/Tablet) */
        <div className="space-y-3">
          {properties.map((property, i) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PropertyListCard
                id={property._id}
                name={property.name}
                type={property.type}
                address={property.address}
                currentValue={property.currentValue}
                tenantCount={property.tenantCount}
                status={property.status}
              />
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
