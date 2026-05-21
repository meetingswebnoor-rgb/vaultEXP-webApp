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
  HelpCircle,
  Users,
  MessageSquare,
  FolderGit2,
  KanbanSquare,
  Bot,
  Bell,
  Landmark,
  Activity,
  Receipt,
  ArrowRightLeft,
  FileBarChart,
  Repeat,
  ReceiptText,
  Zap
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
  { label: 'Financial OS',href: '/financial',     icon: Landmark,   isNew: true },
  { label: 'Documents',   href: '/documents',     icon: FileText,   isNew: true },
  { label: 'CRM',         href: '/crm',           icon: Users,      isNew: true },
  { label: 'Teams',       href: '/team-ai',       icon: Bot,        isNew: true },
  { label: 'Analytics',   href: '/business/analytics', icon: TrendingUp },
  { label: 'Notifications', href: '/notifications', icon: Bell,       badge: '3' },
  { label: 'Vault AI',    href: '/ai',            icon: Sparkles,   isAI: true },
  { label: 'Automations', href: '/automation',    icon: Zap,        isNew: true },
  { label: 'Tasks',       href: '/projects',      icon: KanbanSquare, isNew: true },
  { label: 'Calendar',    href: '/calendar',      icon: Calendar,   isNew: true },
  
  // Secondary existing valid routes
  { label: 'Workspaces',  href: '/workspaces',    icon: FolderGit2, isNew: true },
  { label: 'Transactions',href: '/transactions',  icon: ArrowRightLeft, isNew: true },
  { label: 'Expenses',    href: '/expenses',      icon: ReceiptText, isNew: true },
  { label: 'Accounting',  href: '/accounting',    icon: FileBarChart, isNew: true },
  { label: 'Reports',     href: '/accounting/reports', icon: FileBarChart, isNew: true },
  { label: 'Banking',     href: '/banking',       icon: Landmark,   isNew: true },
  { label: 'Invoices',    href: '/invoices',      icon: Receipt,    isNew: true },
  { label: 'Subscriptions',href: '/invoices/subscriptions', icon: Repeat, isNew: true },
  { label: 'Activity',    href: '/activity',      icon: Activity,     isNew: true },
  { label: 'Chat',        href: '/chat',          icon: MessageSquare, isNew: true },
];

export const RESOURCE_NAV: NavItem[] = [
  { label: 'Action Center', href: '/ai-action-center',   icon: Sparkles, isNew: true },
  { label: 'AI Advisor',    href: '/financial/advisor', icon: Sparkles, isAI: true, isNew: true },
];

export const SYSTEM_NAV: NavItem[] = [
  { label: 'Security', href: '/security',           icon: Shield, isNew: true },
  { label: 'Billing & Plans', href: '/settings/billing', icon: Repeat, isNew: true },
  { label: 'Profile',  href: '/profile',            icon: User       },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings   },
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
  { label: 'Documents', href: '/documents',     icon: FileText    },
  { label: 'Profile',   href: '/profile',       icon: User        },
];
