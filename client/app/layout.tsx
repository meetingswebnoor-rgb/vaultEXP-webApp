import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { QuickActionModal } from '@/components/ui/QuickActionModal';

export const metadata: Metadata = {
  title: {
    default: 'VaultEXP — Smart Asset & Finance Management',
    template: '%s | VaultEXP',
  },
  description:
    'VaultEXP is your AI-powered SaaS platform for managing business assets, property portfolios, and financial vaults in one unified workspace.',
  keywords: ['vault', 'asset management', 'finance', 'property', 'SaaS', 'business'],
  authors: [{ name: 'VaultEXP Team' }],
  creator: 'VaultEXP',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'VaultEXP',
    title: 'VaultEXP — Smart Asset & Finance Management',
    description: 'AI-powered SaaS platform for managing business assets and finance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultEXP — Smart Asset & Finance Management',
    description: 'AI-powered SaaS platform for managing business assets and finance.',
    creator: '@vaultexp',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via <link> to avoid next/font SWC requirement */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-vault-dark text-white antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <QuickActionModal />
      </body>
    </html>
  );
}
