'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { GlobalModal } from '@/components/ui/GlobalModal';
import { Property } from '@/types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property; // To edit existing property
}

export function AddPropertyModal({ isOpen, onClose, property }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    type: 'residential',
    address: '',
    purchaseValue: '',
    currentValue: ''
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        type: property.type || 'residential',
        address: property.address || '',
        purchaseValue: property.purchaseValue?.toString() || '',
        currentValue: property.currentValue?.toString() || ''
      });
    } else {
      setFormData({ name: '', type: 'residential', address: '', purchaseValue: '', currentValue: '' });
    }
  }, [property, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);



    try {
      const payload = {
        ...formData,
        purchaseValue: formData.purchaseValue ? parseFloat(formData.purchaseValue) : 0,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : (formData.purchaseValue ? parseFloat(formData.purchaseValue) : 0)
      };

      if (property) {
        const res = await api.put(`/property/${property._id}`, payload);

      } else {
        const res = await api.post('/property/create', payload);

      }

      setSuccess(true);
      
      // Force immediate re-fetch
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['property-stats'] });
      if (property) {
        await queryClient.invalidateQueries({ queryKey: ['property', property._id] });
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
        if (!property) {
          setFormData({ name: '', type: 'residential', address: '', purchaseValue: '', currentValue: '' });
        }
      }, 1500);
    } catch (err: any) {
      console.error('[PROPERTY] Submission Error:', err);
      setError(err.response?.data?.message || `Failed to ${property ? 'update' : 'create'} property. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? 'Edit Property' : 'Add Property'}
      description={property ? 'Update details of your property.' : 'Record a new real estate asset.'}
      icon={<Building2 size={22} />}
      maxWidth="max-w-md"
    >
      {success ? (
        <div className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-vault-green/20 border border-vault-green/30 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-vault-green" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Property {property ? 'Updated' : 'Added'}!</h3>
          <p className="text-gray-400 text-sm">Asset has been successfully {property ? 'updated' : 'recorded'} in your portfolio.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Property Name *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Sunset Heights"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Purchase Value</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={formData.purchaseValue}
                  onChange={e => setFormData({ ...formData, purchaseValue: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Address *</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required
                type="text" 
                placeholder="Full street address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none"
              />
            </div>
          </div>

          {/* Add Current Value field if editing */}
          {property && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Current Value</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={formData.currentValue}
                  onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-vault-green/50 outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-vault-green text-black font-bold text-sm shadow-xl shadow-vault-green/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              property ? 'Update Property' : 'Save Property'
            )}
          </button>
        </form>
      )}
    </GlobalModal>
  );
}
