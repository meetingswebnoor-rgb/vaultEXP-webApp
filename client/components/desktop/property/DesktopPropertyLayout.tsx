'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PropertySidebar } from './PropertySidebar';
import { PropertyDetailView } from './PropertyDetailView';
import { PropertyEmptyState } from '@/components/property/PropertyEmptyState';
import { useActionStore } from '@/store/actionStore';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';

export function DesktopPropertyLayout({ properties, stats, onAdd }: { properties: any[]; stats?: any; onAdd: () => void }) {
  const [activeId, setActiveId] = useState<string>(properties[0]?._id ?? '');
  const { openAction } = useActionStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch full detail when selection changes
  const { data: detail, isLoading } = useQuery({
    queryKey: ['property', activeId],
    queryFn: async () => {
      const res = await api.get(`/api/property/${activeId}`);
      return res.data.data;
    },
    enabled: !!activeId,
  });

  if (properties.length === 0) {
    return <PropertyEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-vault-dark overflow-hidden">
      <PropertySidebar
        properties={properties}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={onAdd}
        stats={stats}
      />
      <PropertyDetailView
        property={detail}
        isLoading={isLoading}
        onEdit={() => setIsEditOpen(true)}
        onAddTenant={() => {/* Tenant logic handled via modal soon */}}
        onAddExpense={() => openAction('expense')}
        onUploadDocument={() => openAction('document')}
      />
      
      {detail && (
        <AddPropertyModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          property={detail} 
        />
      )}
    </div>
  );
}
