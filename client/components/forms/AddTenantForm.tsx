'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, DollarSign, ChevronRight, Loader2, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const tenantSchema = z.object({
  name: z.string().min(2, 'Tenant name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  propertyId: z.string().min(1, 'Please select a property'),
  rentAmount: z.string().min(1, 'Rent amount is required').transform(v => parseFloat(v)),
  leaseStartDate: z.string().min(1, 'Lease start date is required'),
  leaseEndDate: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface AddTenantFormProps {
  initialPropertyId?: string;
}

export function AddTenantForm({ initialPropertyId }: AddTenantFormProps) {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(!initialPropertyId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      propertyId: initialPropertyId || '',
    },
  });

  useEffect(() => {
    if (!initialPropertyId) {
      const fetchProps = async () => {
        try {
          const res = await api.get('/property');
          setProperties(res.data?.data?.properties || []);
        } catch (err) {
          console.error('Failed to fetch properties', err);
        } finally {
          setIsLoadingProps(false);
        }
      };
      fetchProps();
    }
  }, [initialPropertyId]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post(`/property/${data.propertyId}/tenants`, data);
      showToast('Tenant added successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to add tenant', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Property Selector (if not provided) */}
      {!initialPropertyId && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Building2 size={12} className="text-blue-400" />
            Select Property
          </label>
          <select
            {...register('propertyId')}
            disabled={isLoadingProps}
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer",
              errors.propertyId && "border-red-500/50"
            )}
          >
            <option value="">{isLoadingProps ? 'Loading properties...' : 'Choose a property'}</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.propertyId && <p className="text-[10px] text-red-400 ml-1">{errors.propertyId.message}</p>}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <User size={12} className="text-vault-green" />
          Tenant Full Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. John Doe"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.name && "border-red-500/50 focus:border-red-500"
          )}
        />
        {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Mail size={12} className="text-blue-400" />
            Email
          </label>
          <input
            {...register('email')}
            placeholder="john@example.com"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Phone size={12} className="text-orange-400" />
            Phone
          </label>
          <input
            {...register('phone')}
            placeholder="+1 234 567 890"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Rent Amount */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <DollarSign size={12} className="text-vault-green" />
            Monthly Rent
          </label>
          <input
            {...register('rentAmount')}
            type="number"
            placeholder="0.00"
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
              errors.rentAmount && "border-red-500/50"
            )}
          />
        </div>

        {/* Lease Start */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calendar size={12} className="text-purple-400" />
            Lease Start
          </label>
          <input
            {...register('leaseStartDate')}
            type="date"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-400 transition-all focus:outline-none focus:border-vault-green/50 appearance-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        type="submit"
        className="w-full flex items-center justify-between px-8 py-5 rounded-[1.25rem] bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="flex items-center gap-2">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Register Tenant'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}
