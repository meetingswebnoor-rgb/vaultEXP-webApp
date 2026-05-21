'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { FileText, User, DollarSign, Calendar, Plus, Trash2, ChevronRight, Loader2, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActionStore } from '@/store/actionStore';
import { cn } from '@/lib/utils/cn';

const invoiceSchema = z.object({
  businessId: z.string().min(1, 'Please select a business'),
  clientName: z.string().min(2, 'Client name is required'),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    qty: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1, 'At least one item required'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function AddInvoiceForm() {
  const { closeAction } = useActionStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', qty: 1, unitPrice: 0 }],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    const fetchBiz = async () => {
      try {
        const res = await api.get('/business');
        setBusinesses(res.data?.data?.businesses || []);
      } catch (err) {
        console.error('Failed to fetch businesses', err);
      }
    };
    fetchBiz();
  }, []);

  const items = watch('items');
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Calculate totals on submit as well
      const payload = {
        ...data,
        subtotal,
        totalAmount: subtotal, // For simplicity, no tax/discount here
      };
      await api.post('/invoices', payload);
      showToast('Invoice created successfully', 'success');
      closeAction();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
      {/* Business Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Briefcase size={12} className="text-vault-green" />
          Issuer Business
        </label>
        <select
          {...register('businessId')}
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 transition-all focus:outline-none focus:border-vault-green/50 appearance-none cursor-pointer",
            errors.businessId && "border-red-500/50"
          )}
        >
          <option value="">Select Business</option>
          {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <User size={12} className="text-blue-400" />
          Client Name
        </label>
        <input
          {...register('clientName')}
          placeholder="e.g. Acme Corp"
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all focus:outline-none focus:border-vault-green/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Due Date</label>
          <input
            {...register('dueDate')}
            type="date"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-400 transition-all focus:outline-none focus:border-vault-green/50 appearance-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Total (Preview)</label>
          <div className="w-full bg-vault-green/5 border border-vault-green/20 rounded-2xl px-5 py-4 text-sm text-vault-green font-bold flex items-center gap-2">
            <DollarSign size={14} />
            {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <FileText size={12} className="text-orange-400" />
            Line Items
          </label>
          <button 
            type="button"
            onClick={() => append({ description: '', qty: 1, unitPrice: 0 })}
            className="text-[10px] font-bold text-vault-green hover:underline flex items-center gap-1"
          >
            <Plus size={10} /> Add Item
          </button>
        </div>

        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
          {fields.map((field, index) => (
            <motion.div 
              key={field.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 items-start bg-white/[0.02] p-3 rounded-xl border border-white/5"
            >
              <div className="flex-1 space-y-2">
                <input
                  {...register(`items.${index}.description` as const)}
                  placeholder="Service or Product"
                  className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-gray-700"
                />
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Qty</span>
                    <input
                      {...register(`items.${index}.qty` as const, { valueAsNumber: true })}
                      type="number"
                      className="w-full bg-transparent border-none p-0 text-xs text-white focus:ring-0"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Price</span>
                    <input
                      {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                      type="number"
                      className="w-full bg-transparent border-none p-0 text-xs text-white focus:ring-0 text-right"
                    />
                  </div>
                </div>
              </div>
              {fields.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="mt-1 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
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
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Invoice'}
        </span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </form>
  );
}
