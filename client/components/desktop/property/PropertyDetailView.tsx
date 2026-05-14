'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, TrendingUp, TrendingDown, DollarSign,
  Users, Receipt, FileText, UploadCloud, Edit3, MoreHorizontal,
  AlertCircle, ExternalLink, Download, Shield, X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TenantManager } from '@/components/property/TenantManager';
import { RentManager } from '@/components/property/RentManager';
import { ExpenseManager } from '@/components/property/ExpenseManager';
import { DocumentManager } from '@/components/property/DocumentManager';
import { AlertManager } from '@/components/property/AlertManager';
import { PropertyAnalytics } from '@/components/property/PropertyAnalytics';
import { ExpenseModal } from '@/components/property/ExpenseModal';
import { DocumentModal } from '@/components/property/DocumentModal';

type Tab = 'overview' | 'tenants' | 'rent' | 'expenses' | 'documents';

const CAT_COLORS: Record<string, string> = {
  maintenance: '#F59E0B', repair: '#EF4444', tax: '#8B5CF6',
  insurance: '#3B82F6', mortgage: '#EC4899', utilities: '#06B6D4',
  management_fee: '#10B981', renovation: '#F97316', other: '#6B7280',
};

const DOC_ICONS: Record<string, string> = {
  lease_agreement: '📄', insurance: '🛡️', mortgage: '🏦',
  title_deed: '🏛️', tax_certificate: '🧾', inspection_report: '🔍', other: '📁',
};

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} strokeWidth={1.8} />
        </div>
        {sub && (
          <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full',
            sub.startsWith('+') ? 'bg-vault-green/10 text-vault-green' : 'bg-red-500/10 text-red-400')}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[22px] font-bold font-display text-white">{value}</p>
    </div>
  );
}

// ── Tenant Table ──────────────────────────────────────────────────
function TenantTable({ tenants, onAdd }: { tenants: any[]; onAdd?: () => void }) {
  if (tenants.length === 0) return (
    <EmptySection icon={Users} label="No tenants yet" action="Add Tenant" onAction={onAdd} />
  );
  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.04] border-b border-white/[0.06]">
            {['Tenant', 'Contact', 'Rent / Month', 'Lease Ends', 'Status'].map(h => (
              <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {tenants.map(t => (
            <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vault-green/20 to-emerald-500/10 border border-vault-green/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-vault-green">{t.name.charAt(0)}</span>
                  </div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                </div>
              </td>
              <td className="px-5 py-4">
                <p className="text-[12px] text-gray-400">{t.email ?? '—'}</p>
                <p className="text-[11px] text-gray-600">{t.phone ?? ''}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-[14px] font-bold text-vault-green">${t.rentAmount.toLocaleString()}</p>
              </td>
              <td className="px-5 py-4 text-[12px] text-gray-400">
                {t.leaseEndDate ? fmtDate(t.leaseEndDate) : '—'}
              </td>
              <td className="px-5 py-4">
                <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                  t.status === 'active' ? 'bg-vault-green/10 text-vault-green' : 'bg-gray-500/10 text-gray-500')}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Document grid removed, handled by DocumentManager.

// ── Empty Section ─────────────────────────────────────────────────
function EmptySection({ icon: Icon, label, action, onAction }: {
  icon: React.ElementType; label: string; action: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/[0.07] rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
        <Icon size={22} className="text-gray-600" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] text-gray-500">{label}</p>
      {onAction && (
        <button onClick={onAction}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-vault-green/10 border border-vault-green/20 text-vault-green text-[12px] font-semibold hover:bg-vault-green/20 transition-colors">
          <UploadCloud size={13} /> {action}
        </button>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────
export function PropertyDetailView({
  property, isLoading, onEdit, onAddTenant, onAddExpense, onUploadDocument,
}: {
  property?: any;
  isLoading?: boolean;
  onEdit?: () => void;
  onAddTenant?: () => void;
  onAddExpense?: () => void;
  onUploadDocument?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vault-green/20 border-t-vault-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
          <Building2 size={28} className="text-gray-600" strokeWidth={1.4} />
        </div>
        <p className="text-gray-500 text-[14px]">Select a property to view details</p>
      </div>
    );
  }

  const isAppreciating = property.appreciation >= 0;
  const tabs: { id: Tab; label: string; count: number; hideBadge?: boolean }[] = [
    { id: 'overview',  label: 'Overview',  count: 0, hideBadge: true },
    { id: 'tenants',   label: 'Tenants',   count: property.tenants?.length ?? 0 },
    { id: 'rent',      label: 'Rent',      count: 0, hideBadge: true },
    { id: 'expenses',  label: 'Expenses',  count: property.expenses?.length ?? 0 },
    { id: 'documents', label: 'Documents', count: property.documents?.length ?? 0 },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-vault-dark/20">
      <div className="max-w-5xl mx-auto px-8 xl:px-12 py-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-vault-green/10 border border-vault-green/20">
              <Building2 size={26} className="text-vault-green" strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="text-[28px] font-bold font-display text-white leading-tight">{property.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <MapPin size={12} className="text-gray-500" />
                <p className="text-[13px] text-gray-400">{property.address}</p>
                <span className="text-gray-700">·</span>
                <span className="text-[11px] font-bold capitalize px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">
                  {property.type}
                </span>
                <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full',
                  property.status === 'active' ? 'bg-vault-green/10 text-vault-green' : 'bg-gray-500/10 text-gray-500')}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-semibold text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all">
              <Edit3 size={14} /> Edit
            </button>
            <button onClick={() => setShowReport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vault-green text-black text-[13px] font-bold shadow-lg shadow-vault-green/20 hover:brightness-110 transition-all">
              Generate Report
            </button>
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard label="Current Value" value={fmt(property.currentValue)} icon={DollarSign} color="#00FF88" />
          <StatCard label="Purchase Value" value={fmt(property.purchaseValue)} icon={DollarSign} color="#3B82F6" />
          <StatCard
            label="Appreciation"
            value={`${property.appreciation ?? 0}%`}
            sub={isAppreciating ? `+${property.appreciation}%` : `${property.appreciation}%`}
            icon={isAppreciating ? TrendingUp : TrendingDown}
            color={isAppreciating ? '#00FF88' : '#EF4444'}
          />
          <StatCard
            label="Monthly Income"
            value={fmt(property.summary?.monthlyRentIncome ?? 0)}
            icon={Users}
            color="#8B5CF6"
          />
        </div>

        {/* ── Alert Manager ───────────────────────────────────────── */}
        <AlertManager propertyId={property._id} />

        {/* ── Action Bar ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { label: 'Add Expense',   icon: Receipt,     color: '#F59E0B', action: () => setOpenExpenseModal(true) },
            { label: 'Upload Doc',    icon: UploadCloud, color: '#8B5CF6', action: () => setOpenDocModal(true) },
          ].map(({ label, icon: Icon, color, action }) => (
            <button key={label} onClick={action}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ color }}>
                <Icon size={14} strokeWidth={2} />
              </div>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Bar ───────────────────────────────────────────── */}
        <div className="flex gap-6 border-b border-vault-border/30 mb-6">
          {tabs.map(({ id, label, count, hideBadge }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn('relative pb-4 text-[13px] font-bold uppercase tracking-widest transition-all flex items-center gap-2',
                  active ? 'text-white' : 'text-gray-500 hover:text-gray-300')}>
                {label}
                {count > 0 && !hideBadge && (
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-vault-green/20 text-vault-green' : 'bg-white/[0.07] text-gray-600')}>
                    {count}
                  </span>
                )}
                {active && <motion.div layoutId="detail-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-vault-green" />}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {activeTab === 'overview'  && <PropertyAnalytics propertyId={property._id} />}
            {activeTab === 'tenants'   && <TenantManager propertyId={property._id} propertyName={property.name} />}
            {activeTab === 'rent'      && <RentManager propertyId={property._id} />}
            {activeTab === 'expenses'  && <ExpenseManager propertyId={property._id} />}
            {activeTab === 'documents' && <DocumentManager propertyId={property._id} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <ExpenseModal 
        isOpen={openExpenseModal} 
        onClose={() => setOpenExpenseModal(false)} 
        propertyId={property._id} 
      />
      <DocumentModal 
        isOpen={openDocModal} 
        onClose={() => setOpenDocModal(false)} 
        propertyId={property._id} 
      />

      {/* ── Report Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-vault-dark border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold font-display text-white">Property Report</h3>
                <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Property</p>
                  <p className="text-sm font-bold text-white">{property.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-vault-green/5 border border-vault-green/10">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Monthly Rent</p>
                    <p className="text-[15px] text-vault-green font-bold mt-1">{fmt(property.summary?.monthlyRentIncome ?? 0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Expenses</p>
                    <p className="text-[15px] text-red-400 font-bold mt-1">{fmt(property.summary?.totalExpenses ?? 0)}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex justify-between items-center">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Net Profit</p>
                  <p className="text-lg text-white font-bold">{fmt((property.summary?.monthlyRentIncome ?? 0) - (property.summary?.totalExpenses ?? 0))}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    propertyName: property.name,
                    totalRent: property.summary?.monthlyRentIncome ?? 0,
                    expenses: property.summary?.totalExpenses ?? 0,
                    profit: (property.summary?.monthlyRentIncome ?? 0) - (property.summary?.totalExpenses ?? 0)
                  }, null, 2));
                  const anchor = document.createElement('a');
                  anchor.setAttribute("href", dataStr);
                  anchor.setAttribute("download", `${property.name}_report.json`);
                  anchor.click();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] font-semibold text-[13px] text-white rounded-xl transition-all"
              >
                <Download size={14} /> Download JSON
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
