'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Building2, MapPin, DollarSign, Calendar, ChevronRight, Loader2, Home } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const propertySchema = z.object({
  name: z.string().min(2, 'Property name is required'),
  address: z.string().min(5, 'Full address is required'),
  type: z.string().default('residential'),
  purchaseValue: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  purchaseDate: z.string().optional(),
  bedrooms: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  bathrooms: z.string().optional().transform(v => v ? parseInt(v) : undefined),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export function AddPropertyForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'residential',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/property/create', data);
      showToast('Property added successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to add property', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Building2 size={12} className="text-blue-400" />
          Property Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Sunset Heights Villa"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.name && "border-red-500/50 focus:border-red-500"
          )}
        />
        {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <MapPin size={12} className="text-red-400" />
          Full Address
        </label>
        <input
          {...register('address')}
          placeholder="Street, City, State, ZIP"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
            errors.address && "border-red-500/50 focus:border-red-500"
          )}
        />
        {errors.address && <p className="text-[10px] text-red-400 ml-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Home size={12} className="text-vault-green" />
            Type
          </label>
          <select
            {...register('type')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="land">Land</option>
            <option value="mixed_use">Mixed Use</option>
          </select>
        </div>

        {/* Purchase Value */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <DollarSign size={12} className="text-vault-green" />
            Value
          </label>
          <input
            {...register('purchaseValue')}
            type="number"
            placeholder="0.00"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bedrooms */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bedrooms</label>
          <input
            {...register('bedrooms')}
            type="number"
            placeholder="0"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
          />
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bathrooms</label>
          <input
            {...register('bathrooms')}
            type="number"
            placeholder="0"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
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
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Property'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}
