'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <ShieldAlert className="text-red-500 w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Widget Rendering Failure</h2>
      <p className="text-gray-400 max-w-md mb-8">
        A localized error occurred while rendering this module. The rest of the dashboard remains operational.
        <br/><br/>
        <span className="text-xs text-gray-600 font-mono">{error.message}</span>
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 rounded-xl transition-all hover:border-white/20"
      >
        <RefreshCw size={18} />
        Attempt Recovery
      </button>
    </div>
  );
}
