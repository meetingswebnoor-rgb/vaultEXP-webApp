'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Kanban, Activity } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { VaultAIOrb } from '@/components/branding/VaultAIOrb';

const TABS = [
  { label: 'Overview', href: '/crm', icon: Activity },
  { label: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
  { label: 'Contacts', href: '/crm/contacts', icon: Users },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full space-y-6 p-6 md:p-8 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <VaultAIOrb size={24} compact />
            Enterprise CRM
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage leads, pipelines, and AI-driven client insights.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          // Exact match or active sub-route for contacts
          const isActive = pathname === tab.href || (tab.href !== '/crm' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                isActive
                  ? 'bg-vault-green/10 text-vault-green border border-vault-green/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 pb-10">
        {children}
      </div>
    </div>
  );
}
