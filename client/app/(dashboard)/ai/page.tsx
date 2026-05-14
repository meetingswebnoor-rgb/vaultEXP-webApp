import { Metadata } from 'next';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ModuleCard } from '@/components/ui/ModuleCard';

export const metadata: Metadata = {
  title: 'AI Intelligence',
};

export default function AiPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="VaultAI" 
        description="Ask questions, generate reports, and get insights." 
      />
      <ModuleCard className="min-h-[400px] flex items-center justify-center text-white/40">
        AI Chat & Insights Placeholder
      </ModuleCard>
    </PageContainer>
  );
}
