'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, TrendingUp, TrendingDown, Users, Receipt,
  FileText, Plus, ChevronRight, Loader2, AlertCircle,
  DollarSign, Calendar, Shield, Home,
} from 'lucide-react';
import { ExpenseModal } from '@/components/property/ExpenseModal';
import { DocumentModal } from '@/components/property/DocumentModal';
import { AIPropertyAdvisor } from '@/components/property/AIPropertyAdvisor';

// ── Types ────────────────────────────────────────────────────────

interface Tenant {
  _id: string;
  name: string;
  rentAmount: number;
  status: 'active' | 'inactive' | 'vacated';
  leaseEndDate?: string;
  phone?: string;
}

interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface PropertyDoc {
  _id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileUrl: string;
}

interface Alert {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'seen' | 'completed';
}

interface PropertyDetail {
  _id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  purchaseValue: number;
  currentValue: number;
  appreciation: number;
  equity: number;
  tenants: Tenant[];
  expenses: Expense[];
  documents: PropertyDoc[];
  alerts: Alert[];
  summary: {
    tenantCount: number;
    activeTenants: number;
    totalExpenses: number;
    monthlyRentIncome: number;
    pendingAlerts: number;
  };
}

type Tab = 'tenants' | 'expenses' | 'documents' | 'ai-insights';

// ── Sub-components ───────────────────────────────────────────────

const PRIORITY_COLORS = {
  low: '#6B7280', medium: '#F59E0B', high: '#EF4444', critical: '#FF1744',
};

const DOC_ICONS: Record<string, string> = {
  lease_agreement: '📄', insurance: '🛡️', mortgage: '🏦',
  title_deed: '🏛️', tax_certificate: '🧾', other: '📁',
};

function formatMoney(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── TENANT CARD ──────────────────────────────────────────────────
function TenantCard({ tenant }: { tenant: Tenant }) {
  const isActive = tenant.status === 'active';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vault-green/20 to-emerald-500/20 border border-vault-green/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-bold text-vault-green">
            {tenant.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-tight">{tenant.name}</p>
          {tenant.leaseEndDate && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              Lease ends {formatDate(tenant.leaseEndDate)}
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-[14px] font-bold text-vault-green">${tenant.rentAmount.toLocaleString()}/mo</p>
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: isActive ? 'rgba(0,255,136,0.1)' : 'rgba(107,114,128,0.1)',
            color: isActive ? '#00FF88' : '#6B7280',
          }}
        >
          {tenant.status}
        </span>
      </div>
    </motion.div>
  );
}

// ── EXPENSE ROW ──────────────────────────────────────────────────
function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center flex-shrink-0">
          <Receipt size={14} className="text-red-400" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-white capitalize">{expense.category.replace(/_/g, ' ')}</p>
          <p className="text-[11px] text-gray-600">{formatDate(expense.date)}</p>
        </div>
      </div>
      <p className="text-[14px] font-bold text-red-400">-{formatMoney(expense.amount)}</p>
    </motion.div>
  );
}

// ── DOCUMENT ROW ─────────────────────────────────────────────────
function DocumentRow({ doc }: { doc: PropertyDoc }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-2.5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0 text-[16px]">
          {DOC_ICONS[doc.type] ?? '📁'}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-tight">{doc.name}</p>
          <p className="text-[11px] text-gray-500 capitalize mt-0.5">{doc.type.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-gray-600">{formatDate(doc.uploadedAt)}</p>
        <ChevronRight size={14} className="text-gray-700 ml-auto mt-1" />
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────

export function PropertyDashboard({
  property,
  isLoading = false,
  error = null,
  onAddTenant,
  onAddExpense,
  onUploadDocument,
}: {
  property?: PropertyDetail;
  isLoading?: boolean;
  error?: string | null;
  onAddTenant?: () => void;
  onAddExpense?: () => void;
  onUploadDocument?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('tenants');
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openDocModal, setOpenDocModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-vault-green animate-spin" />
          <p className="text-sm text-gray-500 animate-pulse">Loading property…</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-4 mt-6">
        <AlertCircle size={18} className="flex-shrink-0" />
        <p className="text-sm">{error ?? 'Property not found.'}</p>
      </div>
    );
  }

  const isAppreciating = property.appreciation >= 0;
  const TYPE_COLOR = {
    residential: '#3B82F6', commercial: '#F59E0B', land: '#10B981',
    industrial: '#8B5CF6', 'mixed-use': '#EC4899', vacation: '#06B6D4', other: '#6B7280',
  }[property.type] ?? '#6B7280';

  return (
    <div className="w-full pb-24 select-none-touch touch-callout-none">

      {/* ── HEADER HERO ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-4 pt-2 pb-6">
        {/* Background glow */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[70px] opacity-15 pointer-events-none"
          style={{ backgroundColor: TYPE_COLOR }}
        />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full blur-[60px] opacity-10 pointer-events-none bg-vault-green" />

        {/* Icon + name */}
        <div className="flex items-start gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
            style={{ backgroundColor: `${TYPE_COLOR}20`, border: `1.5px solid ${TYPE_COLOR}40` }}
          >
            <Building2 size={26} style={{ color: TYPE_COLOR }} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold font-display text-white leading-tight truncate">
              {property.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin size={12} className="text-gray-500 flex-shrink-0" />
              <p className="text-[12px] text-gray-400 leading-none truncate">{property.address}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full capitalize"
                style={{ backgroundColor: `${TYPE_COLOR}18`, color: TYPE_COLOR }}
              >
                {property.type}
              </span>
              <span
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: property.status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(107,114,128,0.1)',
                  color: property.status === 'active' ? '#00FF88' : '#6B7280',
                }}
              >
                {property.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUE CARD ───────────────────────────────────────────── */}
      <div className="mx-4 mb-4">
        <div
          className="relative overflow-hidden rounded-[28px] p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,136,0.07), rgba(0,255,136,0.02))',
            border: '1px solid rgba(0,255,136,0.15)',
          }}
        >
          {/* Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-vault-green/10 rounded-full blur-[50px] pointer-events-none" />

          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Value</p>
          <p className="text-[36px] font-bold font-display text-vault-green leading-none mb-4">
            {formatMoney(property.currentValue)}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Purchase value */}
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Purchase</p>
              <p className="text-[13px] font-bold text-white">{formatMoney(property.purchaseValue)}</p>
            </div>

            {/* Appreciation */}
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Gain</p>
              <div className="flex items-center gap-1">
                {isAppreciating
                  ? <TrendingUp size={12} className="text-vault-green" />
                  : <TrendingDown size={12} className="text-red-400" />}
                <p className={`text-[13px] font-bold ${isAppreciating ? 'text-vault-green' : 'text-red-400'}`}>
                  {property.appreciation}%
                </p>
              </div>
            </div>

            {/* Equity */}
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Equity</p>
              <p className="text-[13px] font-bold text-white">{formatMoney(property.equity)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────────────── */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-3">
        {[
          { icon: Users,      label: 'Tenants',  value: property.summary.activeTenants, color: '#3B82F6' },
          { icon: DollarSign, label: 'Monthly',  value: `$${property.summary.monthlyRentIncome.toLocaleString()}`, color: '#00FF88' },
          { icon: AlertCircle, label: 'Alerts',  value: property.summary.pendingAlerts, color: property.summary.pendingAlerts > 0 ? '#F59E0B' : '#6B7280' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/[0.06] text-center">
            <div
              className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
            >
              <Icon size={15} style={{ color }} strokeWidth={1.8} />
            </div>
            <p className="text-[14px] font-bold text-white">{value}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users,    label: 'Add Tenant',   onClick: onAddTenant,       color: '#3B82F6' },
            { icon: Receipt,  label: 'Add Expense',  onClick: () => setOpenExpenseModal(true),      color: '#F59E0B' },
            { icon: FileText, label: 'Upload Doc',   onClick: () => setOpenDocModal(true),  color: '#8B5CF6' },
          ].map(({ icon: Icon, label, onClick, color }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.92 }}
              onClick={onClick}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30`, color }}
              >
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <p className="text-[11px] font-semibold text-gray-300 text-center leading-tight">{label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── TAB BAR ──────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex bg-white/[0.03] rounded-2xl p-1 border border-white/[0.06] gap-1">
          {(['tenants', 'expenses', 'documents', 'ai-insights'] as Tab[]).map((tab) => {
            const counts: Record<Tab, number> = {
              tenants:   property.tenants.length,
              expenses:  property.expenses.length,
              documents: property.documents.length,
              'ai-insights': 0,
            };
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 relative py-2.5 rounded-xl text-[12px] font-semibold capitalize transition-colors"
                style={{ color: isActive ? '#0A0A0F' : '#6B7280' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-vault-green"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab === 'ai-insights' ? 'AI Advisor' : tab}
                  {counts[tab] > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.07)',
                        color: isActive ? '#0A0A0F' : '#9CA3AF',
                      }}
                    >
                      {counts[tab]}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────── */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'tenants' && (
            <motion.div
              key="tenants"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {property.tenants.length === 0 ? (
                <EmptyTabState icon={Users} label="No tenants yet" action="Add Tenant" onAction={onAddTenant} />
              ) : (
                property.tenants.map(t => <TenantCard key={t._id} tenant={t} />)
              )}
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.05] px-4 pt-2 pb-2"
            >
              {property.expenses.length === 0 ? (
                <EmptyTabState icon={Receipt} label="No expenses yet" action="Add Expense" onAction={() => setOpenExpenseModal(true)} />
              ) : (
                property.expenses.map(e => <ExpenseRow key={e._id} expense={e} />)
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {property.documents.length === 0 ? (
                <EmptyTabState icon={FileText} label="No documents yet" action="Upload Document" onAction={() => setOpenDocModal(true)} />
              ) : (
                property.documents.map(d => <DocumentRow key={d._id} doc={d} />)
              )}
            </motion.div>
          )}

          {activeTab === 'ai-insights' && (
            <motion.div
              key="ai-insights"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AIPropertyAdvisor propertyId={property._id} propertyName={property.name} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {property && (
        <>
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
        </>
      )}
    </div>
  );
}

// ── Empty Tab State ──────────────────────────────────────────────
function EmptyTabState({
  icon: Icon, label, action, onAction,
}: { icon: React.ElementType; label: string; action: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
        <Icon size={22} className="text-gray-600" strokeWidth={1.6} />
      </div>
      <p className="text-[13px] text-gray-500">{label}</p>
      {onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vault-green/10 border border-vault-green/20 text-vault-green text-[13px] font-semibold"
        >
          <Plus size={14} />
          {action}
        </motion.button>
      )}
    </div>
  );
}
