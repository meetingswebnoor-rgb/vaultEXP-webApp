'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Edit3, Trash2, Phone, Mail, Calendar,
  DollarSign, AlertCircle, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { tenantApi, type Tenant, type TenantFormData } from '@/features/property/tenantApi';
import { TenantModal } from '@/components/property/TenantModal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils/cn';

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Mobile: Tenant Card ───────────────────────────────────────
function TenantCard({
  tenant, onEdit, onDelete, deleting,
}: {
  tenant: Tenant; onEdit: () => void; onDelete: () => void; deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = tenant.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden mb-3"
    >
      {/* Main row */}
      <button onClick={() => setExpanded(p => !p)} className="w-full p-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vault-green/20 to-emerald-500/10 border border-vault-green/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-bold text-vault-green">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white leading-tight">{tenant.name}</p>
              <p className="text-[12px] text-vault-green font-bold">${tenant.rentAmount.toLocaleString()}/mo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
              isActive ? 'bg-vault-green/10 text-vault-green' : 'bg-gray-500/10 text-gray-500'
            )}>
              {tenant.status}
            </span>
            {expanded ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                {tenant.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-600" />
                    <p className="text-[11px] text-gray-400 truncate">{tenant.email}</p>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-600" />
                    <p className="text-[11px] text-gray-400">{tenant.phone}</p>
                  </div>
                )}
              </div>

              {/* Lease dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Lease Start</p>
                  <p className="text-[12px] font-semibold text-white">{fmtDate(tenant.leaseStartDate)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Lease End</p>
                  <p className={cn('text-[12px] font-semibold',
                    tenant.isLeaseExpiringSoon ? 'text-amber-400' : 'text-white')}>
                    {fmtDate(tenant.leaseEndDate)}
                    {tenant.isLeaseExpiringSoon && ' ⚠'}
                  </p>
                </div>
              </div>

              {/* Security deposit */}
              {!!tenant.securityDeposit && (
                <div className="flex items-center gap-2">
                  <DollarSign size={12} className="text-gray-600" />
                  <p className="text-[11px] text-gray-400">
                    Security deposit: <span className="text-white font-semibold">${tenant.securityDeposit.toLocaleString()}</span>
                  </p>
                </div>
              )}

              {/* Notes */}
              {tenant.notes && (
                <p className="text-[11px] text-gray-500 italic">{tenant.notes}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={onEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[12px] font-semibold text-gray-300 hover:text-white transition-colors">
                  <Edit3 size={13} /> Edit
                </button>
                <button onClick={onDelete} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Desktop: Tenant Table ─────────────────────────────────────
function TenantTable({
  tenants, onEdit, onDelete, deletingId,
}: {
  tenants: Tenant[]; onEdit: (t: Tenant) => void; onDelete: (id: string) => void; deletingId: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.04] border-b border-white/[0.06]">
            {['Tenant', 'Contact', 'Rent / Mo', 'Lease Period', 'Status', ''].map(h => (
              <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {tenants.map(t => {
            const isActive = t.status === 'active';
            return (
              <motion.tr key={t._id} layout exit={{ opacity: 0 }}
                className="hover:bg-white/[0.02] transition-colors group">
                {/* Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vault-green/20 to-emerald-500/10 border border-vault-green/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-vault-green">{t.name.charAt(0)}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  </div>
                </td>
                {/* Contact */}
                <td className="px-5 py-4">
                  <p className="text-[12px] text-gray-400">{t.email ?? '—'}</p>
                  <p className="text-[11px] text-gray-600">{t.phone ?? ''}</p>
                </td>
                {/* Rent */}
                <td className="px-5 py-4">
                  <p className="text-[14px] font-bold text-vault-green">${t.rentAmount.toLocaleString()}</p>
                  {t.securityDeposit ? (
                    <p className="text-[10px] text-gray-600">dep. ${t.securityDeposit.toLocaleString()}</p>
                  ) : null}
                </td>
                {/* Lease period */}
                <td className="px-5 py-4">
                  <p className="text-[12px] text-gray-300">{fmtDate(t.leaseStartDate)}</p>
                  <p className={cn('text-[11px]', t.isLeaseExpiringSoon ? 'text-amber-400 font-semibold' : 'text-gray-600')}>
                    {t.leaseEndDate ? `→ ${fmtDate(t.leaseEndDate)}` : 'Month-to-month'}
                    {t.isLeaseExpiringSoon && ' ⚠'}
                  </p>
                </td>
                {/* Status */}
                <td className="px-5 py-4">
                  <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                    isActive ? 'bg-vault-green/10 text-vault-green' : 'bg-gray-500/10 text-gray-500')}>
                    {t.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(t)}
                      className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => onDelete(t._id)} disabled={deletingId === t._id}
                      className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                      {deletingId === t._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN: TenantManager ───────────────────────────────────────
export function TenantManager({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName?: string;
}) {
  const { isMobile, isTablet } = useBreakpoint();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Tenant | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────
  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => tenantApi.list(propertyId),
    enabled: !!propertyId,
  });

  // ── Mutations ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: TenantFormData) => tenantApi.create(propertyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants', propertyId] });
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TenantFormData> }) =>
      tenantApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants', propertyId] });
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantApi.delete(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants', propertyId] });
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });

  const handleSubmit = async (data: TenantFormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t: Tenant) => { setEditing(t); setModalOpen(true); };

  // ── Render ───────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-7 h-7 text-vault-green animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle size={16} /> Failed to load tenants.
    </div>
  );

  return (
    <>
      {/* ── Section header ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <p className="text-[13px] font-bold text-gray-300">
            Tenants
            {tenants.length > 0 && (
              <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-vault-green/10 text-vault-green font-bold">
                {tenants.length}
              </span>
            )}
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vault-green/10 border border-vault-green/20 text-vault-green text-[12px] font-bold hover:bg-vault-green/20 transition-colors">
          <Plus size={13} strokeWidth={2.5} /> Add Tenant
        </button>
      </div>

      {/* ── Empty state ──────────────────────────────────────── */}
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 border border-dashed border-white/[0.08] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Users size={22} className="text-gray-600" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] text-gray-500">No tenants yet</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vault-green/10 border border-vault-green/20 text-vault-green text-[13px] font-semibold hover:bg-vault-green/20 transition-colors">
            <Plus size={14} /> Add First Tenant
          </button>
        </div>
      ) : isMobile || isTablet ? (
        /* Mobile: cards */
        <AnimatePresence>
          {tenants.map(t => (
            <TenantCard key={t._id} tenant={t}
              onEdit={() => openEdit(t)}
              onDelete={() => deleteMutation.mutate(t._id)}
              deleting={deletingId === t._id}
            />
          ))}
        </AnimatePresence>
      ) : (
        /* Desktop: table */
        <TenantTable
          tenants={tenants}
          onEdit={openEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deletingId}
        />
      )}

      {/* ── Modal ────────────────────────────────────────────── */}
      <TenantModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        existing={editing}
        propertyName={propertyName}
      />
    </>
  );
}
