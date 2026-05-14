'use client';

import { useState } from 'react';
import { BusinessSidebar } from './BusinessSidebar';
import { BusinessDetailView } from './BusinessDetailView';
import { useActionStore } from '@/store/actionStore';

export function DesktopBusinessLayout({ businesses }: { businesses: any[] }) {
  const [activeId, setActiveId] = useState(businesses[0]?._id);
  const { openAction } = useActionStore();

  const activeBusiness = businesses.find(b => b._id === activeId);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-vault-dark overflow-hidden">
      <BusinessSidebar 
        businesses={businesses} 
        activeId={activeId} 
        onSelect={setActiveId}
        onAdd={() => openAction('business')}
      />
      <BusinessDetailView business={activeBusiness} />
    </div>
  );
}
