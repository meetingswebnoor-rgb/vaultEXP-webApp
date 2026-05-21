import { Metadata } from 'next';
import { PageContainer } from '@/components/layouts/PageContainer';
import { DocumentVault } from '@/components/documents/DocumentVault';

export const metadata: Metadata = {
  title: 'Document Vault',
};

export default function DocumentsPage() {
  return (
    <PageContainer noPadding>
      <DocumentVault />
    </PageContainer>
  );
}
