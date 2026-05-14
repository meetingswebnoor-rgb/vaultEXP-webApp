'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, DollarSign, Calendar, Loader2, AlertCircle } from 'lucide-react';
import type { Tenant, TenantFormData } from '@/features/property/tenantApi';
import { GlobalModal } from '@/components/ui/GlobalModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TenantFormData) => Promise<void>;
  existing?: Tenant | null;   // pass to pre-fill for edit mode
  propertyName?: string;
}

const EMPTY: TenantFormData = {
  name: '', email: '', phone: '',
  rentAmount: '', securityDeposit: '',
  leaseStartDate: '', leaseEndDate: '',
  paymentDueDay: 1, status: 'active', notes: '',
};

// ── Reusable field ────────────────────────────────────────────
function Field({
  label, id, type = 'text', placeholder, value, onChange,
  icon: Icon, required, error, hint,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string | number; onChange: (v: string) => void;
  icon?: React.ElementType; required?: boolean; error?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
        {label}{required && <span className="text-vault-green ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: focused ? '#00FF88' : '#4B5563' }}>
            <Icon size={14} strokeWidth={2} />
          </div>
        )}
        <input
          id={id} type={type} value={value} required={required} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-xl py-2.5 text-[13px] text-white placeholder-gray-600 bg-white/[0.04] outline-none transition-all"
          style={{
            paddingLeft: Icon ? '38px' : '14px', paddingRight: '14px',
            border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : focused ? 'rgba(0,255,136,0.35)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(0,255,136,0.06)' : 'none',
          }}
        />
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1"><AlertCircle size={10}/>{error}</p>}
      {hint && !error && <p className="text-[10px] text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}

export function TenantModal({ isOpen, onClose, onSubmit, existing, propertyName }: Props) {
  const isEdit = !!existing;
  const [form, setForm]     = useState<TenantFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (existing) {
      setForm({
        name:            existing.name,
        email:           existing.email ?? '',
        phone:           existing.phone ?? '',
        rentAmount:      existing.rentAmount,
        securityDeposit: existing.securityDeposit ?? '',
        leaseStartDate:  existing.leaseStartDate?.slice(0, 10) ?? '',
        leaseEndDate:    existing.leaseEndDate?.slice(0, 10) ?? '',
        paymentDueDay:   existing.paymentDueDay ?? 1,
        status:          existing.status,
        notes:           existing.notes ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setApiError(null);
  }, [existing, isOpen]);

  const set = (k: keyof TenantFormData) => (v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())        e.name = 'Name is required';
    if (!form.rentAmount)         e.rentAmount = 'Rent amount is required';
    if (Number(form.rentAmount) <= 0) e.rentAmount = 'Must be greater than 0';
    if (!form.leaseStartDate)     e.leaseStartDate = 'Lease start date is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await onSubmit({
        ...form,
        rentAmount:      Number(form.rentAmount),
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
      });
      onClose();
    } catch (e: any) {
      setApiError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Tenant' : 'Add Tenant'}
      description={propertyName || (isEdit ? 'Update tenant details.' : 'Register a new resident.')}
      icon={<User size={22} />}
      maxWidth="max-w-lg"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

        {/* API error */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
            <AlertCircle size={14} className="flex-shrink-0" /> {apiError}
          </div>
        )}

        {/* Name */}
        <Field id="t-name" label="Full Name" required placeholder="e.g. Sarah Johnson"
          value={form.name} onChange={set('name')} icon={User} error={errors.name} />

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="t-email" label="Email" type="email" placeholder="sarah@email.com"
            value={form.email ?? ''} onChange={set('email')} icon={Mail} error={errors.email} />
          <Field id="t-phone" label="Phone" type="tel" placeholder="+1 234 567 8900"
            value={form.phone ?? ''} onChange={set('phone')} icon={Phone} />
        </div>

        {/* Rent + Deposit */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="t-rent" label="Monthly Rent ($)" required type="number" placeholder="2500"
            value={form.rentAmount} onChange={set('rentAmount')} icon={DollarSign}
            error={errors.rentAmount} />
          <Field id="t-dep" label="Security Deposit ($)" type="number" placeholder="5000"
            value={form.securityDeposit ?? ''} onChange={set('securityDeposit')} icon={DollarSign} />
        </div>

        {/* Lease dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="t-start" label="Lease Start" required type="date"
            value={form.leaseStartDate} onChange={set('leaseStartDate')}
            icon={Calendar} error={errors.leaseStartDate} />
          <Field id="t-end" label="Lease End" type="date"
            value={form.leaseEndDate ?? ''} onChange={set('leaseEndDate')} icon={Calendar}
            hint="Leave blank for month-to-month" />
        </div>

        {/* Status (edit only) */}
        {isEdit && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Status
            </label>
            <select
              value={form.status} onChange={e => set('status')(e.target.value)}
              className="w-full rounded-xl py-2.5 px-3.5 text-[13px] text-white bg-white/[0.04] border border-white/[0.08] outline-none focus:border-vault-green/35 transition-colors appearance-none"
            >
              {['active', 'inactive', 'vacated', 'evicted'].map(s => (
                <option key={s} value={s} className="bg-[#0D0D14] capitalize">{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Notes
          </label>
          <textarea
            value={form.notes ?? ''} onChange={e => set('notes')(e.target.value)}
            placeholder="Any additional notes…" rows={3}
            className="w-full rounded-xl py-2.5 px-3.5 text-[13px] text-white placeholder-gray-600 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-vault-green/35 resize-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-semibold text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-vault-green text-black text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-vault-green/20 hover:brightness-110 disabled:opacity-60 transition-all">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Tenant'}
          </button>
        </div>
      </form>
    </GlobalModal>
  );
}
