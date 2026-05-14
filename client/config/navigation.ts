import { 
  LayoutGrid, 
  Vault, 
  TrendingUp, 
  Building2, 
  Wallet, 
  FileText, 
  Calendar, 
  Sparkles, 
  Settings,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';

export interface NavItem {
  label:   string;
  href:    string;
  icon:    any;
  badge?:  string;
  isNew?:  boolean;
  isAI?:   boolean; // renders with special AI glow treatment in desktop sidebar
}

/**
 * Shared Navigation Configuration
 *
 * Centralizing this ensures that both the Mobile Bottom Nav
 * and the Desktop Sidebar stay in sync when new modules are added.
 */

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',     icon: LayoutGrid  },
  { label: 'Businesses',  href: '/business',      icon: TrendingUp  },
  { label: 'Properties',  href: '/property',      icon: Building2,  badge: '3' },
  { label: 'Investments', href: '/investment',    icon: Wallet      },
  { label: 'Wallet',      href: '/wallet',        icon: Vault,      badge: '12' },
];

export const RESOURCE_NAV: NavItem[] = [
  { label: 'Analytics', href: '/business/analytics', icon: TrendingUp },
  { label: 'Vault AI',  href: '/ai',        icon: Sparkles, isNew: true, isAI: true },
];

export const SYSTEM_NAV: NavItem[] = [
  { label: 'Profile',  href: '/profile',            icon: User       },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings   },
  { label: 'Security', href: '/security',           icon: Shield     },
  { label: 'Help',     href: '/help',               icon: HelpCircle },
];

/** @deprecated Use MOBILE_NAV_TABS for new code */
export const MOBILE_BOTTOM_TABS = [
  MAIN_NAV[0], // Overview
  MAIN_NAV[1], // Businesses
  MAIN_NAV[2], // Properties
  SYSTEM_NAV[0], // Profile
];

// ── 5-Tab Mobile Bottom Nav ─────────────────────────────────────────────────────
//
// Layout: [Home] [Portfolio] [· AI ·] [Features] [Profile]
//                              ↑
//               isCenter = true → elevated glowing button
//
export interface MobileNavTab {
  label:     string;
  href:      string;
  icon:      any;
  isCenter?: boolean; // renders as elevated glow FAB
  badge?:    string;
}

export const MOBILE_NAV_TABS: MobileNavTab[] = [
  { label: 'Home',      href: '/dashboard',     icon: LayoutGrid  },
  { label: 'Portfolio', href: '/investment',    icon: Vault,       badge: '12' },
  { label: 'AI',        href: '/ai',            icon: Sparkles,    isCenter: true },
  { label: 'Features',  href: '/business',      icon: TrendingUp  },
  { label: 'Profile',   href: '/profile',       icon: User        },
];
