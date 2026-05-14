import { Metadata } from 'next';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BusinessAnalytics } from '@/features/analytics/components/BusinessAnalytics';

export const metadata: Metadata = {
  title: 'Business Analytics | Executive Vault',
};

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Business Analytics" 
        description="Comprehensive financial insights and performance tracking across your business ecosystem." 
      />
      <div className="mt-8">
        <BusinessAnalytics />
      </div>
    </PageContainer>
  );
}
