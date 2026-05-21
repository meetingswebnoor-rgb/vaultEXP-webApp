'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05050A] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full" />
          <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-display tracking-tight">Something went wrong</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The vault encountered an unexpected error. This has been logged and we&apos;re looking into it.
          </p>
          {error.digest && (
            <p className="text-[10px] text-gray-600 font-mono">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-vault-green text-black font-bold py-3.5 rounded-xl hover:bg-vault-green-hover transition-all shadow-lg shadow-vault-green/20"
          >
            <RefreshCcw size={18} />
            Try to Recover
          </button>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <Home size={18} />
            Return to Safety
          </Link>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-[11px] text-gray-600 uppercase tracking-widest font-bold">Vault Intelligence System</p>
        </div>
      </div>
    </div>
  );
}
