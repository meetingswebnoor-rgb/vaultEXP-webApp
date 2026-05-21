import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05050A] flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-vault-green/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="relative inline-block">
            <span className="text-[120px] font-black font-display text-white/5 select-none tracking-tighter">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="text-vault-green/40 animate-pulse" size={48} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Vault Entry Not Found</h1>
            <p className="text-gray-500 text-sm max-w-[280px] mx-auto leading-relaxed">
              The record you&apos;re looking for doesn&apos;t exist or has been moved to another vault.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-vault-green text-black font-bold py-4 rounded-2xl hover:bg-vault-green-hover transition-all shadow-xl shadow-vault-green/20"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-vault-green animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Network Status: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
