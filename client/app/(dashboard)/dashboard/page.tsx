'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Settings2, Briefcase, Building2, TrendingUp, Landmark } from 'lucide-react';
import { DEFAULT_LAYOUT } from '@/components/dashboard/DashboardCustomizer';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils/cn';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';

// ── Mobile components ────────────────────────────────────────
import { PortfolioCard } from '@/components/mobile/PortfolioCard';
import { QuickActions } from '@/components/mobile/QuickActions';
import { ModuleCards, RecentTransactions } from '@/components/mobile/ModuleCards';
import { InvestmentSummaryStrip } from '@/components/mobile/InvestmentSummaryStrip';

// ── Desktop components ────────────────────────────────────────
import {
  PortfolioOverview,
  InsightsCard,
  ModulePreviewCard,
  ActivityTable,
  AlertsCard,
  QuickActionsCard
} from '@/components/desktop/dashboard';

const DashboardCustomizer = dynamic(
  () => import('@/components/dashboard/DashboardCustomizer').then(m => m.DashboardCustomizer),
  { ssr: false }
);

// Static data for modules that don't yet have a live API source
const STATIC_MODULES_DATA = [
  {
    title: 'Businesses',
    count: '3',
    value: '$44,300',
    delta: '-2.1%',
    up: false,
    icon: Briefcase,
    color: 'orange' as const,
    route: '/business',
    items: [
      { label: 'VaultTech Solutions', value: '$28,500', sub: 'Q2 Profit: +$4.2k' },
      { label: 'GreenEnergy Co',      value: '$12,800', sub: 'Stable' },
      { label: 'Retail Ventures',     value: '$3,000',  sub: 'Needs attention' },
    ]
  },
  {
    title: 'Properties',
    count: '4',
    value: '$120,000',
    delta: '+1.8%',
    up: true,
    icon: Building2,
    color: 'blue' as const,
    route: '/property',
    items: [
      { label: 'Skyline Apartment', value: '$45,000', sub: 'Rent: $1.2k/mo' },
      { label: 'Coastal Villa',     value: '$65,000', sub: 'Appreciating' },
      { label: 'Downtown Studio',   value: '$10,000', sub: 'Renovating' },
    ]
  },
];

/**
 * DashboardPage — Dynamic Layout Consumer
 *
 * Renders dashboard sections based on user-defined layout preferences
 * stored in user.settings.dashboardLayout.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useBreakpoint();
  const { user, token } = useAuthStore();
  const [isCustomizing, setIsCustomizing] = useState(false);

  // ── Live Investment Data ──────────────────────────────────────
  const { data: investmentData } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const res = await api.get('/api/investment');
      return res.data;
    },
    enabled: !!token,
    staleTime: 60_000,   // cache 1 min
    retry: 1,
  });

  // 1. Protect Route: Redirect if no token
  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [token, router]);

  // 2. Fetch Dashboard Data
  const { data: dashboardRes, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard');
      return res.data.data;
    },
    enabled: !!token
  });

  const dashboardData = dashboardRes;
  const loading = dashboardLoading;

  const currentLayout =
    user?.settings?.dashboardLayout &&
    Array.isArray(user.settings.dashboardLayout) &&
    user.settings.dashboardLayout.length > 0
      ? user.settings.dashboardLayout
      : DEFAULT_LAYOUT;

  const sortedLayout = [...currentLayout].sort((a, b) => a.order - b.order);

  // ── Build MODULES_DATA — merge static entries with live investment data ──
  const investments = investmentData?.data ?? [];
  const invSummary  = investmentData?.summary ?? { totalValue: 0, totalProfitLoss: 0 };
  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const investmentModule = {
    title: 'Investments',
    count: String(investments.length),
    value: fmt(invSummary.totalValue),
    delta: `${invSummary.totalProfitLoss >= 0 ? '+' : ''}${fmt(Math.abs(invSummary.totalProfitLoss))}`,
    up: invSummary.totalProfitLoss >= 0,
    icon: TrendingUp,
    color: 'purple' as const,
    route: '/investment',
    items: investments.slice(0, 3).map((inv: any) => ({
      label: inv.name,
      value: fmt(inv.currentValue || 0),
      sub: inv.type?.replace('_', ' ') ?? '',
    })),
  };

  const walletModule = {
    title: 'Wallets',
    count: String(dashboardData?.stats?.walletCount || 0),
    value: fmt(dashboardData?.stats?.totalNetWorth || 0),
    delta: 'Liquidity',
    up: true,
    icon: Landmark,
    color: 'blue' as const,
    route: '/wallet',
    items: (dashboardData?.stats?.walletCount || 0) > 0 ? [
      { label: 'Total Liquidity', value: fmt(dashboardData?.stats?.totalNetWorth || 0), sub: 'Across all accounts' }
    ] : []
  };

  // Investments and Wallets are dynamic
  const MODULES_DATA = [...STATIC_MODULES_DATA, investmentModule, walletModule];

  if (loading || !token) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-vault-green border-t-transparent rounded-full" />
      </PageContainer>
    );
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'portfolio':
        return (isMobile || isTablet)
          ? <PortfolioCard />
          : <div className="col-span-12 xl:col-span-8"><PortfolioOverview totalValue={dashboardData?.stats?.totalNetWorth} stats={dashboardData?.stats} /></div>;
      case 'insights':
        return (isMobile || isTablet)
          ? null
          : <div className="col-span-12 xl:col-span-4"><InsightsCard /></div>;
      case 'quickActions':
        return (isMobile || isTablet)
          ? <QuickActions />
          : <div className="col-span-12 lg:col-span-4"><QuickActionsCard /></div>;
      case 'modules':
        return (isMobile || isTablet)
          ? (
            <>
              <InvestmentSummaryStrip />
              <ModuleCards />
            </>
          )
          : (
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MODULES_DATA.map((mod) => (
                <ModulePreviewCard key={mod.title} {...mod} />
              ))}
            </div>
          );
      case 'activity':
        return (isMobile || isTablet)
          ? <RecentTransactions data={dashboardData?.recentActivity} />
          : <div className="col-span-12 lg:col-span-4"><ActivityTable data={dashboardData?.recentActivity} /></div>;
      case 'alerts':
        return (isMobile || isTablet)
          ? null
          : <div className="col-span-12 lg:col-span-4"><AlertsCard /></div>;
      default:
        return null;
    }
  };

  return (
    <PageContainer noPadding={(isMobile || isTablet)} className="relative">
      <AnimatePresence>
        {isCustomizing && <DashboardCustomizer onClose={() => setIsCustomizing(false)} />}
      </AnimatePresence>

      <div className="space-y-6">
        <div className={cn(
          (isMobile || isTablet) ? 'flex justify-end px-5 mt-4' : 'block'
        )}>
          {!isMobile && !isTablet ? (
            <PageHeader
              title="Executive Dashboard"
              className="mb-2"
              actions={
                <button
                  onClick={() => setIsCustomizing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
                >
                  <Settings2 size={14} />
                  Customize
                </button>
              }
            />
          ) : (
            <button
              onClick={() => setIsCustomizing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
            >
              <Settings2 size={14} />
              Customize
            </button>
          )}
        </div>

        <div className={cn(
          'grid grid-cols-12 gap-6',
          (isMobile || isTablet) && 'flex flex-col gap-0'
        )}>
          {sortedLayout.map((section) => {
            if (!section.visible) return null;
            const content = renderSection(section.id);
            if (!content) return null;

            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  (isMobile || isTablet) ? 'col-span-12' : 'contents'
                )}
              >
                {content}
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
