'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, Calendar, Tag, ChevronRight, Loader2, Briefcase, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform(v => parseFloat(v)),
  category: z.string().default('operations'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is required'),
  businessId: z.string().optional(),
  propertyId: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function AddExpenseForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'operations',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, propRes] = await Promise.all([
          api.get('/business'),
          api.get('/property')
        ]);
        setBusinesses(bizRes.data?.data?.businesses || []);
        setProperties(propRes.data?.data?.properties || []);
      } catch (err) {
        console.error('Failed to fetch context data', err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/expenses', data);
      showToast('Expense saved successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <DollarSign size={12} className="text-vault-green" />
            Amount
          </label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn(
              "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50",
              errors.amount && "border-red-500/50"
            )}
          />
        </div>

        {/* Date Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calendar size={12} className="text-blue-400" />
            Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-400 transition-all focus:outline-none focus:border-vault-green/50 appearance-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Tag size={12} className="text-orange-400" />
          Category
        </label>
        <select
          {...register('category')}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
        >
          <optgroup label="Business">
            <option value="operations">Operations</option>
            <option value="marketing">Marketing</option>
            <option value="payroll">Payroll</option>
            <option value="software">Software</option>
          </optgroup>
          <optgroup label="Property">
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="insurance">Insurance</option>
          </optgroup>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Link to Business */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Briefcase size={12} className="text-gray-400" />
            Business (Optional)
          </label>
          <select
            {...register('businessId')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="">None</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Link to Property */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Building2 size={12} className="text-gray-400" />
            Property (Optional)
          </label>
          <select
            {...register('propertyId')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer"
          >
            <option value="">None</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Receipt size={12} className="text-purple-400" />
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="What was this expense for?"
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50 h-24 resize-none",
            errors.description && "border-red-500/50"
          )}
        />
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        type="submit"
        className="w-full flex items-center justify-between px-8 py-5 rounded-[1.25rem] bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="flex items-center gap-2">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Expense'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}
