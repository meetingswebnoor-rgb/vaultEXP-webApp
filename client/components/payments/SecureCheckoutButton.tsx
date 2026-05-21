import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SecureCheckoutButtonProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
}

export function SecureCheckoutButton({ invoiceId, amount, currency = 'USD', onSuccess }: SecureCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Request Secure Payment Intent from VaultEXP Backend
      const res = await api.post('/financial/payments/intent', {
        invoiceId,
        amount,
        currency,
        provider: 'stripe'
      });

      const { clientSecret } = res.data.data;

      // 2. In a real environment, you would use stripe-js to redirect to checkout
      // or open a Stripe Elements modal using the clientSecret.
      // e.g., const stripe = await loadStripe('pk_test_...');
      // await stripe.confirmCardPayment(clientSecret, { ... });
      
      console.log('Secure Client Secret received:', clientSecret);
      
      // For demonstration in this OS, since we aren't loading the actual Stripe iframe:
      // We simulate success callback after receiving the intent.
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setLoading(false);
      }, 1500);

    } catch (err: any) {
      console.error('Checkout failed', err);
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-indigo-500 hover:bg-indigo-400 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
        {loading ? 'Processing...' : 'Pay Securely'}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 text-[10px] text-red-400 font-bold whitespace-nowrap bg-black/80 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
