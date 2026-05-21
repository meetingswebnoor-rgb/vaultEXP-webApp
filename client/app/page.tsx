import { Metadata } from 'next';
import Link from 'next/link';
import { AutoRedirect } from '@/components/guards/AutoRedirect';

export const metadata: Metadata = {
  title: 'Home',
  description: 'VaultEXP — AI-powered asset and finance management platform.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-vault-dark flex flex-col items-center justify-center px-4">
      <AutoRedirect />
      {/* Hero */}
      <section className="text-center max-w-4xl mx-auto py-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-vault-green/30 bg-vault-green/10 px-4 py-1.5 text-sm text-vault-green">
          <span className="h-2 w-2 rounded-full bg-vault-green animate-pulse" />
          Now in Beta — Join thousands of users
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Manage Your{' '}
          <span className="text-gradient">Vaults</span>
          <br />
          Like Never Before
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          VaultEXP is your unified platform for managing business assets, property
          portfolios, and financial vaults — powered by AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full mx-auto pb-24">
        {[
          { label: 'Active Vaults', value: '12K+' },
          { label: 'Assets Tracked', value: '$2.4B+' },
          { label: 'Users', value: '8,500+' },
          { label: 'Countries', value: '40+' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-6 text-center">
            <p className="font-display text-3xl font-bold text-vault-green">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
