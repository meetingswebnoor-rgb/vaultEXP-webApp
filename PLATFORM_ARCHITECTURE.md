# VaultEXP — Master Platform Architecture Guide

> **CRITICAL FOR ALL FUTURE DEVELOPMENT**
> This document describes the REAL, existing architecture of VaultEXP.
> Before adding ANY new feature, system, or module — read this guide.
> Duplicating existing systems is the #1 cause of instability in this project.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication System](#4-authentication-system)
5. [User Roles & RBAC](#5-user-roles--rbac)
6. [Portal Architecture](#6-portal-architecture)
7. [Route Architecture](#7-route-architecture)
8. [Dashboard System](#8-dashboard-system)
9. [Sidebar & Navigation](#9-sidebar--navigation)
10. [Workspace Architecture](#10-workspace-architecture)
11. [Database & Prisma Schema](#11-database--prisma-schema)
12. [Backend API Architecture](#12-backend-api-architecture)
13. [State Management](#13-state-management)
14. [React Query Strategy](#14-react-query-strategy)
15. [AI Systems](#15-ai-systems)
16. [Module Connections](#16-module-connections)
17. [Security & Permissions](#17-security--permissions)
18. [The 403 Access Denied Problem](#18-the-403-access-denied-problem)
19. [Why the Project Became Unstable](#19-why-the-project-became-unstable)
20. [Platform Stabilization Rules](#20-platform-stabilization-rules)
21. [How to Safely Extend VaultEXP](#21-how-to-safely-extend-vaultexp)

---

## 1. Platform Overview

VaultEXP is an **AI-powered SaaS platform** for managing business assets, property portfolios, investments, and financial vaults in one unified workspace.

### Three Isolated Portals

| Portal | Target User | Login URL | Dashboard URL |
|---|---|---|---|
| **Main App** | Business owners, investors | `/auth/login` | `/dashboard` |
| **Admin Portal** | Super admins, platform admins | `/admin/login` | `/admin/dashboard` |
| **Client Portal** | Invited clients of a business | `/client/login` | `/client/dashboard` |

These three portals are **completely isolated** — different shells, different sidebars, different auth guards, different layouts. A client should NEVER see the main app. An admin should NEVER leak client data.

---

## 2. Tech Stack

### Frontend (`/client`)
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| State (global) | Zustand with persist middleware |
| State (server) | TanStack Query (React Query v5) |
| HTTP client | Axios (with interceptors) |
| Icons | Lucide React |
| Sockets | socket.io-client |
| Font | Inter + Outfit (Google Fonts) |

### Backend (`/server`)
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Language | JavaScript (CommonJS) |
| ORM | Prisma 6 |
| Database | MySQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer |
| Real-time | socket.io |
| Queue | BullMQ + Redis (optional — disabled in dev) |
| Payments | Stripe (webhook handler registered) |

### Infrastructure
| Service | Purpose |
|---|---|
| MySQL | Primary database |
| Redis | Background job queue (optional) |
| Cloudinary | Image hosting |
| Stripe | Payment processing |

---

## 3. Project Structure

```
VaultWebApp/
├── client/                  ← Next.js frontend
│   ├── app/                 ← App Router pages
│   │   ├── (admin)/         ← Route group: Admin portal
│   │   ├── (client)/        ← Route group: Client portal
│   │   ├── (dashboard)/     ← Route group: Main app
│   │   ├── auth/            ← Public auth pages
│   │   ├── admin/           ← Redirect target (admin pages)
│   │   ├── client/          ← Redirect target (client pages)
│   │   └── portal/          ← Legacy portal pages
│   ├── components/
│   │   ├── ai/              ← AI floating UI, sidebar, orb
│   │   ├── auth/            ← Auth forms (login, signup, reset)
│   │   ├── branding/        ← VaultAI orb, logo components
│   │   ├── dashboard/       ← Sidebar + nav components
│   │   ├── desktop/         ← Desktop topbar
│   │   ├── documents/       ← Document vault UI
│   │   ├── guards/          ← AuthGuard, RoleGuard
│   │   ├── investment/      ← Investment UI components
│   │   ├── layouts/         ← Desktop/Mobile layout wrappers
│   │   ├── mobile/          ← Mobile-specific UI components
│   │   ├── notifications/   ← Notification center
│   │   ├── property/        ← Property UI components
│   │   ├── providers/       ← ALL providers live here (canonical)
│   │   │   ├── AuthProvider.tsx    ← Sets hydration flag
│   │   │   ├── Providers.tsx       ← Root provider tree
│   │   │   ├── SocketProvider.tsx  ← Socket.io context (CANONICAL)
│   │   │   └── ThemeProvider.tsx   ← Dark/light mode
│   │   ├── shell/           ← AppShell, AdminShell, ClientShell
│   │   ├── sync/            ← Background sync worker
│   │   ├── ui/              ← Shared UI primitives
│   │   ├── wallet/          ← Wallet UI
│   │   └── workspace/       ← WorkspaceSwitcher
│   ├── config/
│   │   └── navigation.ts    ← SINGLE SOURCE OF TRUTH for nav items
│   ├── hooks/               ← Custom React hooks
│   ├── lib/
│   │   ├── api/             ← Axios client (lib/api/index.ts)
│   │   ├── motion/          ← Adaptive motion utilities
│   │   ├── secureStorage.ts ← Encrypted localStorage wrapper
│   │   └── utils/           ← cn(), formatters, etc.
│   ├── store/
│   │   ├── authStore.ts     ← Zustand auth state (CANONICAL)
│   │   ├── actionStore.ts   ← Quick action state
│   │   ├── liveStore.ts     ← Real-time live data
│   │   └── syncStore.ts     ← Offline sync state
│   └── types/               ← Shared TypeScript types
│
├── server/                  ← Express.js backend
│   ├── prisma/
│   │   └── schema.prisma    ← MySQL schema (27 models)
│   ├── src/
│   │   ├── admin/           ← Admin-specific routes
│   │   ├── ai/              ← AI processing services
│   │   ├── automation/      ← BullMQ automation engine
│   │   ├── config/          ← DB, Redis config
│   │   ├── lib/             ← Prisma client singleton
│   │   ├── middleware/       ← auth, error, security, audit
│   │   ├── modules/         ← All business logic modules
│   │   │   ├── auth/        ← signup, login, JWT
│   │   │   ├── user/        ← user profile
│   │   │   ├── business/    ← business CRUD
│   │   │   ├── property/    ← property + tenant management
│   │   │   ├── investment/  ← investment tracking
│   │   │   ├── wallet/      ← wallet + transactions
│   │   │   ├── financial/   ← financial OS + payments
│   │   │   ├── document/    ← document vault
│   │   │   ├── crm/         ← CRM contacts + pipeline
│   │   │   ├── automation/  ← workflow automation
│   │   │   ├── analytics/   ← analytics aggregation
│   │   │   ├── notification/← push + in-app notifications
│   │   │   ├── security/    ← security logs + audit
│   │   │   ├── workspace/   ← multi-tenant workspaces
│   │   │   ├── client/      ← client portal API
│   │   │   ├── portal/      ← secure portal endpoints
│   │   │   ├── ai/          ← AI routes
│   │   │   ├── billing/     ← Stripe billing
│   │   │   ├── dashboard/   ← dashboard stats
│   │   │   ├── calendar/    ← calendar events
│   │   │   ├── project/     ← tasks + project management
│   │   │   ├── chat/        ← real-time chat
│   │   │   ├── collaboration/← team comments + mentions
│   │   │   ├── activity/    ← activity logs
│   │   │   ├── tickets/     ← support tickets
│   │   │   └── sync/        ← mobile offline sync
│   │   ├── socket/          ← socket.io event handlers
│   │   ├── team/            ← team management
│   │   ├── utils/           ← tokenUtils, appError, etc.
│   │   └── app.js           ← Express app + route mounting
│   └── server.js            ← Entry point (bootstrap)
```

---

## 4. Authentication System

### Architecture Overview

VaultEXP uses **stateless JWT authentication** stored in the browser's localStorage via an encrypted storage layer.

```
User submits credentials
       ↓
POST /api/auth/signup  OR  POST /api/auth/login
       ↓
server/src/modules/auth/auth.service.js
  - bcrypt hash comparison (login)
  - Prisma user.create (signup)
  - signAccessToken(userId, role)  ← JWT signed with JWT_SECRET
       ↓
Response: { user: {...}, accessToken: "eyJ..." }
       ↓
client/components/auth/AuthForms.tsx
  → useAuthStore().login(token, user)
       ↓
authStore.ts (Zustand persist)
  → stores in secureStorage (XOR+Base64 encrypted localStorage)
  → key: "vault-auth-storage"
       ↓
Router.push('/dashboard')
```

### Token Flow (Every API Request)

```
lib/api/index.ts (Axios interceptor)
  → reads secureStorage.getItem('vault-auth-storage')
  → parses JSON → extracts state.token
  → injects: Authorization: Bearer <token>
  → injects: x-workspace-id: <active workspace>
       ↓
server/src/middleware/auth.middleware.js
  → verifies JWT with JWT_SECRET
  → sets req.user = { id, role }
       ↓
Route handler proceeds
```

### Hydration Guard Flow

```
Browser loads /dashboard
       ↓
app/(dashboard)/layout.tsx renders <AuthGuard>
       ↓
AuthGuard checks: isHydrated?
  - NO → shows premium loading screen (max 2s safety timeout)
  - YES → checks isAuthenticated
       ↓
Not authenticated → router.replace('/auth/login?callbackUrl=...')
Authenticated     → renders <AppShell>{children}</AppShell>
```

### Key Files

| File | Purpose |
|---|---|
| `store/authStore.ts` | Canonical Zustand store — token, user, isHydrated |
| `lib/secureStorage.ts` | XOR+Base64 encrypted localStorage adapter |
| `components/guards/AuthGuard.tsx` | Hydration guard + loading screen |
| `components/guards/RoleGuard.tsx` | Role-based access guard |
| `components/providers/AuthProvider.tsx` | Post-mount hydration trigger |
| `server/src/modules/auth/auth.service.js` | Signup + Login logic |
| `server/src/middleware/auth.middleware.js` | JWT verification |
| `server/src/utils/tokenUtils.js` | JWT sign/verify helpers |

### Auth Store State Shape

```typescript
interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin' | 'client';
    settings?: any;
    avatarUrl?: string;
  } | null;
  isAuthenticated: boolean;
  isHydrated: boolean;  // ← CRITICAL: false until localStorage restore completes
}
```

### Why `isHydrated` Matters

Zustand's `persist` middleware restores state from localStorage **asynchronously** after the first render. Components must wait for `isHydrated === true` before reading auth state. If they don't, they'll incorrectly see `isAuthenticated = false` even for logged-in users.

**`AuthGuard`** handles this — it renders a loading screen until `isHydrated` is true. The `AuthProvider` calls `setHydrated()` as the guaranteed post-mount fallback. A 2-second safety timeout also exists in `AuthGuard` to prevent infinite stuck states if localStorage is corrupted.

---

## 5. User Roles & RBAC

### Role Enum (Prisma)

```prisma
enum UserRole {
  user        // Standard dashboard user (business owner, investor)
  admin       // Platform moderator (limited admin access)
  superadmin  // Full platform control
  client      // Invited client — only sees Client Portal
}
```

### Role Capabilities

| Role | Main App | Admin Portal | Client Portal | AI Features |
|---|---|---|---|---|
| `user` | ✅ Full access | ❌ | ❌ | ✅ |
| `admin` | ✅ Full access | ✅ Limited | ❌ | ✅ |
| `superadmin` | ✅ Full access | ✅ Full control | ❌ | ✅ |
| `client` | ❌ | ❌ | ✅ Read-only | ⚠️ Limited |

### Role Guards in Frontend

```typescript
// Main app — allows all authenticated users
<AuthGuard>  // in (dashboard)/layout.tsx

// Admin portal — only admin + superadmin
<RoleGuard allowedRoles={['superadmin', 'admin']} loginUrl="/admin/login">  // in (admin)/layout.tsx

// Client portal — only client role
<RoleGuard allowedRoles={['client']} loginUrl="/client/login">  // in (client)/layout.tsx
```

### Backend RBAC Middleware

```javascript
// server/src/middleware/authorize.middleware.js
// Usage: router.get('/admin/data', protect, authorize('admin', 'superadmin'), handler)
```

---

## 6. Portal Architecture

### Main App Portal

- **Login:** `/auth/login` → renders `AuthLoginForm` from `components/auth/AuthForms.tsx`
- **Signup:** `/auth/signup` → renders `AuthSignupForm`
- **Guard:** `AuthGuard` — allows any authenticated user regardless of role
- **Shell:** `AppShell` → `AppShellInner` → `DesktopDashboard` OR `MobileDashboard`
- **Sidebar:** `Sidebar.tsx` + `SidebarNav.tsx` using `MAIN_NAV` from `config/navigation.ts`

### Admin Portal

- **Login:** `/admin/login` — standalone page with its own form
- **Guard:** `RoleGuard` allowing only `['superadmin', 'admin']`
- **Shell:** `AdminShell.tsx` — dark red-accented header + `AdminSidebar`
- **Sidebar:** `AdminSidebar.tsx` — contains platform management links
- **Routes:** All under `/admin/*` via `(admin)` route group

### Client Portal

- **Login:** `/client/login` — standalone page with white/light theme
- **Guard:** `RoleGuard` allowing only `['client']`
- **Shell:** `ClientShell.tsx` — light gray theme with blue brand color
- **Sidebar:** `ClientSidebar.tsx` — shows only client-appropriate links
- **Routes:** All under `/client/*` via `(client)` route group

### Shell Hierarchy

```
RootLayout (app/layout.tsx)
  └── Providers (QueryClient + AuthProvider + ThemeProvider + Toast + Socket)
       ├── (dashboard)/layout.tsx
       │     └── AuthGuard
       │           └── AppShell
       │                 └── AppShellProvider (sidebar state context)
       │                       └── AppShellInner (breakpoint dispatcher)
       │                             ├── [desktop] DesktopDashboard
       │                             │     ├── VaultAISidebar
       │                             │     ├── FloatingAIOrb
       │                             │     ├── Sidebar
       │                             │     ├── DesktopTopbar
       │                             │     └── {children}
       │                             └── [mobile] MobileDashboard
       │                                   ├── MobileHeader
       │                                   ├── {children}
       │                                   ├── MobileBottomNav
       │                                   └── MobileQuickActionsFAB
       ├── (admin)/layout.tsx
       │     └── RoleGuard[admin,superadmin]
       │           └── AdminShell
       │                 ├── AdminSidebar
       │                 └── {children}
       └── (client)/layout.tsx
             └── RoleGuard[client]
                   └── ClientShell
                         ├── ClientSidebar
                         └── {children}
```

---

## 7. Route Architecture

### Public Routes (no auth required)
```
/                          ← Landing page (app/page.tsx)
/auth/login                ← Main app login
/auth/signup               ← Main app signup
/auth/forgot               ← Password reset request
/auth/reset                ← Password reset form
/admin/login               ← Admin portal login
/client/login              ← Client portal login
/app/login                 ← Legacy alias
```

### Main App Routes (authenticated, any role)
All under `(dashboard)` route group → guarded by `AuthGuard`
```
/dashboard                 ← Main overview
/business                  ← Business list
/business/[id]             ← Business detail
/business/analytics        ← Business analytics
/business/ai-insights      ← AI-powered insights
/property                  ← Property portfolio
/property/[id]             ← Property detail
/investment                ← Investments
/investment/[id]           ← Investment detail
/wallet                    ← Wallet accounts
/wallet/[id]               ← Account detail
/wallet/analytics          ← Wallet analytics
/financial                 ← Financial OS
/financial/advisor         ← AI Financial Advisor
/documents                 ← Document vault
/crm                       ← CRM home
/crm/contacts              ← All contacts
/crm/contacts/[id]         ← Contact detail
/crm/pipeline              ← Sales pipeline
/ai                        ← Vault AI chat
/ai-action-center          ← AI action dashboard
/automation                ← Automation workflows
/automation/builder        ← Drag-n-drop workflow builder
/automation/financial      ← Financial automations
/notifications             ← Notification center
/calendar                  ← Calendar
/projects                  ← Tasks / Projects
/projects/[id]             ← Project detail
/workspaces                ← Workspace management
/workspaces/[id]           ← Workspace detail
/team-ai                   ← AI-powered team tools
/security                  ← Security logs
/transactions              ← Transaction history
/expenses                  ← Expense tracker
/accounting                ← Accounting
/accounting/reports        ← Reports
/banking                   ← Bank accounts
/invoices                  ← Invoice list
/invoices/builder          ← Invoice creator
/invoices/subscriptions    ← Recurring invoices
/chat                      ← Team chat
/activity                  ← Activity feed
/tax                       ← Tax management
/profile                   ← User profile
/reminders                 ← Smart reminders
/support                   ← Support tickets
/support/[id]              ← Ticket detail
/settings/billing          ← Billing settings
/settings/notifications    ← Notification prefs
/dashboard/settings        ← App settings
/dashboard/settings/branding ← Branding customization
/dashboard/workspace/branding ← Workspace branding
```

### Admin Routes (admin/superadmin only)
All under `(admin)` route group → guarded by `RoleGuard[admin,superadmin]`
```
/admin/dashboard           ← Admin overview
/admin/users               ← User management
/admin/users/[id]          ← User detail
/admin/analytics           ← Platform analytics
/admin/billing             ← Revenue + subscriptions
/admin/subscriptions       ← Subscription management
/admin/ai                  ← AI usage monitoring
/admin/communications      ← Mass communications
/admin/financial-audit     ← Financial audit logs
/admin/monitoring          ← System health
/admin/security            ← Security command center
/admin/storage             ← File storage management
/admin/tickets             ← Support tickets
/admin/tickets/[id]        ← Ticket detail
```

### Client Portal Routes (client role only)
All under `(client)` route group → guarded by `RoleGuard[client]`
```
/client/dashboard          ← Client overview
/client/documents          ← Shared documents
/client/invoices           ← Client invoices
/client/approvals          ← Approval requests
/client/analytics          ← Client analytics
/client/messages           ← Messages with host
/client/uploads            ← Upload portal
/client/subscriptions      ← Client subscriptions
/client/reports            ← Financial reports
/client/ai                 ← AI tools (limited)
```

### Next.js Rewrites (Dev Proxy)
```javascript
// next.config.js
{ source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' }
```
All `/api/*` frontend calls are proxied to the backend — **zero CORS in development**.

---

## 8. Dashboard System

### Responsive Layout Dispatch

`AppShellInner.tsx` is the responsive dispatcher:

```typescript
const { isReady, isMobileOrTablet } = useBreakpoint();

if (!isReady) return <LayoutSkeleton />;  // SSR/hydration

return isMobileOrTablet
  ? <MobileDashboard>{children}</MobileDashboard>
  : <DesktopDashboard>{children}</DesktopDashboard>;
```

**Breakpoints (`hooks/useBreakpoint.ts`):**
- Mobile: ≤ 767px
- Tablet: 768px – 1024px
- Desktop: > 1024px

### DesktopDashboard (`components/layouts/DesktopDashboard.tsx`)
- Glass morphism sidebar (260px expanded / 80px collapsed)
- `DesktopTopbar` with search, notifications, AI orb
- Scrollable main content area with ambient glow effects
- `VaultAISidebar` overlay (slides in from right)
- `FloatingAIOrb` bottom-right corner

### MobileDashboard (`components/layouts/MobileDashboard.tsx`)
- `MobileHeader` — compact top bar
- Scrollable main content
- `MobileBottomNav` — 5-tab bottom navigation
- `MobileQuickActionsFAB` — floating action button
- Pull-to-refresh support

### Loading States
1. **`LayoutSkeleton`** — shown while `useBreakpoint` resolves (< 1 render cycle)
2. **`AuthGuard` loading screen** — shown while Zustand rehydrates from localStorage (< 2s max)
3. **Page-level skeletons** — each module page handles its own loading state

---

## 9. Sidebar & Navigation

### Single Source of Truth: `config/navigation.ts`

ALL navigation items are defined here. Do not hardcode nav items in components.

```typescript
export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',          icon: LayoutGrid  },
  { label: 'Businesses',   href: '/business',           icon: TrendingUp  },
  { label: 'Properties',   href: '/property',           icon: Building2   },
  { label: 'Investments',  href: '/investment',         icon: Wallet      },
  { label: 'Wallet',       href: '/wallet',             icon: Vault       },
  { label: 'Financial OS', href: '/financial',          icon: Landmark    },
  { label: 'Documents',    href: '/documents',          icon: FileText    },
  { label: 'CRM',          href: '/crm',                icon: Users       },
  { label: 'Teams',        href: '/team-ai',            icon: Bot         },
  { label: 'Analytics',    href: '/business/analytics', icon: TrendingUp  },
  { label: 'Notifications',href: '/notifications',      icon: Bell        },
  { label: 'Vault AI',     href: '/ai',                 icon: Sparkles, isAI: true },
  { label: 'Automations',  href: '/automation',         icon: Zap         },
  { label: 'Tasks',        href: '/projects',           icon: KanbanSquare},
  { label: 'Calendar',     href: '/calendar',           icon: Calendar    },
  // ... plus secondary routes: Workspaces, Transactions, etc.
];

export const RESOURCE_NAV: NavItem[] = [/* AI tools */];
export const SYSTEM_NAV: NavItem[] = [/* Security, Profile, Settings */];
export const MOBILE_NAV_TABS: MobileNavTab[] = [/* 5 bottom tabs */];
```

### Desktop Sidebar (`Sidebar.tsx`)
- Renders `MAIN_NAV` and `RESOURCE_NAV` via `SidebarNav`
- Spring-animated collapse (260px ↔ 80px) via Framer Motion
- `WorkspaceSwitcher` in header
- Footer: Settings, Branding, Help, user logout
- CSS variables `--ws-primary` and `--ws-sidebar` enable per-workspace theming

### Admin Sidebar (`AdminSidebar.tsx`)
- Completely separate from main `Sidebar.tsx`
- Red accent theme, admin-only links
- Does NOT use `MAIN_NAV`

### Client Sidebar (`ClientSidebar.tsx`)
- Completely separate
- Light/white theme with custom brand color
- Only shows client portal links
- Does NOT use `MAIN_NAV`

### Mobile Bottom Nav (`MobileBottomNav.tsx`)
- Uses `MOBILE_NAV_TABS` from `config/navigation.ts`
- 5 tabs: Home, Portfolio, AI (center elevated), Documents, Profile

---

## 10. Workspace Architecture

### Multi-Tenancy Model

VaultEXP supports multi-workspace users. Each user can belong to multiple workspaces. Workspaces allow team isolation and per-workspace branding.

### Workspace Switcher

`components/workspace/WorkspaceSwitcher.tsx`:
- Displays the active workspace in the sidebar header
- Fetches workspaces from `GET /api/workspaces`
- **Only fires when `isAuthenticated === true`** (guarded with `enabled` flag)
- Switches workspace by saving the ID to `localStorage` under `vault-workspace-id`
- On switch: `window.location.reload()` to reset all React Query caches

### Workspace Isolation

The API client automatically injects `x-workspace-id` header on every request:
```typescript
// lib/api/index.ts
const workspaceId = localStorage.getItem('vault-workspace-id');
config.headers.set('x-workspace-id', workspaceId);
```

The backend's tenant middleware reads this header to scope all data queries to the active workspace.

---

## 11. Database & Prisma Schema

**Database:** MySQL via Prisma 6
**Schema file:** `server/prisma/schema.prisma` (1841 lines, ~27 models)

### Core Models

```
User                ← Central entity. All data relates to a User.
Business            ← user's businesses (with expenses, invoices, docs)
Property            ← real estate (with tenants, rents, expenses)
Tenant              ← property tenants (lease, rent tracking)
RentRecord          ← monthly rent payment tracking
Investment          ← stocks, crypto, real estate, bonds
Wallet              ← bank/crypto accounts
Transaction         ← income/expense/transfer records
Invoice             ← business invoices (draft→paid→overdue)
Expense             ← categorized expenses
Document            ← file vault (PDF, image, doc, video)
DocumentFolder      ← folder hierarchy for documents
Alert               ← smart alerts (invoice due, lease expiry, etc.)
Vault               ← shared document vaults (multi-member)
VaultMember         ← vault access control
Team                ← team groups
TeamMember          ← team membership
Workspace           ← multi-tenant workspace
WorkspaceMember     ← workspace membership + role
CRMContact          ← CRM contacts
ClientPortalLink    ← links a User[client] to a host User[user]
PortalMessage       ← client ↔ host messaging
Notification        ← in-app + push notifications
SecurityLog         ← security audit events
ActivityLog         ← user activity tracking
CalendarEvent       ← calendar
ChatRoom            ← team chat rooms
ChatMessage         ← chat messages
SupportTicket       ← help desk tickets
SyncDraft           ← offline mobile sync drafts
WhiteLabelConfig    ← per-business white-label branding
```

### Key Prisma Patterns

```prisma
// All models use cuid() IDs (not auto-increment)
model User {
  id String @id @default(cuid())
  // ...
}

// Soft delete pattern
model User {
  deletedAt DateTime? @map("deleted_at")
  @@index([status, deletedAt])
}

// All Prisma field names use snake_case @map
passwordHash String? @map("password_hash")

// All table names use plural snake_case @@map
@@map("users")
```

### Running Prisma
```bash
# Generate client after schema changes
cd server && npx prisma generate

# Push schema to database (dev only)
cd server && npx prisma db push

# View database
cd server && npx prisma studio

# DANGER: Reset database (loses all data)
cd server && npx prisma migrate reset
```

---

## 12. Backend API Architecture

### Entry Point: `server/src/app.js`

All routes mount under `/api/*`. The `safeLoad()` wrapper prevents any single broken module from crashing the entire server — it returns a 503 stub instead.

### API Endpoints (Full Map)

| Prefix | Module | Auth Required |
|---|---|---|
| `POST /api/auth/signup` | Create account | ❌ Public |
| `POST /api/auth/login` | Authenticate | ❌ Public |
| `POST /api/auth/logout` | Clear session | ❌ Public |
| `GET /api/auth/me` | Get current user | ✅ JWT |
| `GET /api/dashboard` | Dashboard stats | ✅ JWT |
| `GET/POST /api/business` | Business CRUD | ✅ JWT |
| `GET/POST /api/property` | Property CRUD | ✅ JWT |
| `GET/POST /api/investment` | Investment CRUD | ✅ JWT |
| `GET/POST /api/wallet` | Wallet CRUD | ✅ JWT |
| `GET/POST /api/financial` | Financial OS | ✅ JWT |
| `GET/POST /api/documents` | Document vault | ✅ JWT |
| `GET/POST /api/workspaces` | Workspace management | ✅ JWT |
| `GET/POST /api/crm` | CRM contacts/pipeline | ✅ JWT |
| `GET/POST /api/ai` | AI chat + insights | ✅ JWT |
| `GET/POST /api/automation` | Workflow automation | ✅ JWT |
| `GET/POST /api/analytics` | Analytics data | ✅ JWT |
| `GET/POST /api/notifications` | Notifications | ✅ JWT |
| `GET/POST /api/calendar` | Calendar events | ✅ JWT |
| `GET/POST /api/projects` | Tasks/Projects | ✅ JWT |
| `GET/POST /api/chat` | Real-time chat | ✅ JWT |
| `GET/POST /api/security` | Security logs | ✅ JWT |
| `GET/POST /api/billing` | Stripe billing | ✅ JWT |
| `GET/POST /api/tickets` | Support tickets | ✅ JWT |
| `GET/POST /api/client` | Client portal | ✅ JWT + Role[client] |
| `GET/POST /api/portal` | Portal endpoints | ✅ JWT |
| `GET/POST /api/admin/*` | Admin operations | ✅ JWT + Role[admin] |
| `POST /api/webhooks/stripe` | Stripe webhooks | ❌ Stripe signature |

### JWT Middleware (`auth.middleware.js`)

```javascript
// Verifies: Authorization: Bearer <token>
// Sets: req.user = { id: userId, role: userRole }
// Throws: 401 if invalid/expired, 403 if insufficient role
```

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 13. State Management

### Zustand Auth Store (`store/authStore.ts`)

The **single canonical source of truth** for authentication.

```typescript
const useAuthStore = create(persist(
  (set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isHydrated: false,
    login: (token, user) => set({ token, user, isAuthenticated: true }),
    logout: () => set({ token: null, user: null, isAuthenticated: false }),
    setHydrated: () => set({ isHydrated: true }),
    // ...
  }),
  {
    name: 'vault-auth-storage',
    storage: createJSONStorage(() => secureStorage),
    onRehydrateStorage: () => (state) => {
      if (state) state.setHydrated();
    },
  }
));
```

**Do NOT create any other auth state.** Do NOT create another Zustand store for auth. Do NOT use React Context for auth.

### Other Stores

| Store | Purpose |
|---|---|
| `actionStore.ts` | Quick action modal visibility |
| `liveStore.ts` | Real-time live data (socket events) |
| `syncStore.ts` | Mobile offline sync draft queue |

### AppShell State (`AppShellContext.tsx`)

Shell UI state — sidebar collapsed, mobile drawer open, FAB open, notifications panel, AI sidebar. This is React Context (not Zustand) because it's purely UI state that doesn't need persistence.

---

## 14. React Query Strategy

### Query Client Config (`Providers.tsx`)

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — aggressive caching
      gcTime: 30 * 60 * 1000,          // 30 min garbage collection
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if ([401, 403, 404].includes(error?.status)) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});
```

### Auth-Guarded Queries

**Always** use `enabled: isAuthenticated` for queries that require auth:

```typescript
const { data } = useQuery({
  queryKey: ['workspaces'],
  queryFn: () => api.get('/workspaces').then(r => r.data),
  enabled: isAuthenticated,  // ← MANDATORY for protected queries
  retry: 1,
});
```

Without `enabled`, the query fires during the auth loading screen, getting a 401, which triggers React Query's retry loop.

### Cache Invalidation After Mutations

```typescript
const queryClient = useQueryClient();
// After a mutation succeeds:
queryClient.invalidateQueries({ queryKey: ['businesses'] });
```

---

## 15. AI Systems

### VaultAI Sidebar (`components/ai/VaultAISidebar.tsx`)

- Floating slide-in panel (right side of desktop layout)
- Toggled via `AppShellContext.toggleAISidebar()`
- Connected to `POST /api/ai` for chat completions
- Context-aware: can reference the current page's data

### Floating AI Orb (`components/ai/FloatingAIOrb.tsx`)

- Fixed bottom-right corner button
- Opens `VaultAISidebar` on click
- Animated green glow ring (VaultAIOrb branding component)

### AI Action Center (`components/ai/AIActionCenter.tsx`)

- Dedicated page at `/ai-action-center`
- Displays AI-suggested actions based on portfolio state

### AI Assistant (`components/ai/AIAssistant.tsx`)

- Mounted in root layout (always present)
- Global keyboard shortcut trigger
- Floating modal interface

### AI Notification Center (`components/ai/AINotificationCenter.tsx`)

- AI-generated smart notifications
- Integrated with the notification system

### AI Workspace Isolation

AI context is scoped by workspace ID via the `x-workspace-id` header — the AI only has access to data within the active workspace. This prevents cross-tenant data leakage.

### Financial AI

- `/financial/advisor` — AI Financial Advisor page
- `/business/ai-insights` — Business-specific AI insights
- `/team-ai` — Team AI tools

---

## 16. Module Connections

### Data Flow Between Modules

```
User
  ├── creates Business
  │     ├── has Expenses (tracked)
  │     ├── has Invoices (sent to clients)
  │     ├── has Documents (stored in vault)
  │     └── has CRMContacts (pipeline)
  │
  ├── owns Properties
  │     ├── has Tenants (with lease tracking)
  │     ├── receives RentRecords (payment history)
  │     ├── has Expenses (maintenance, mortgage)
  │     └── has Documents (legal docs)
  │
  ├── holds Investments
  │     ├── tracked by type (stock, crypto, real estate)
  │     └── triggers Alerts (stop-loss, take-profit)
  │
  ├── has Wallets
  │     ├── has Transactions (income/expense/transfer)
  │     └── linked to Business (optional)
  │
  ├── belongs to Workspaces
  │     ├── shares data with TeamMembers
  │     └── hosts ClientPortalLinks
  │
  ├── receives Notifications (AI + system alerts)
  ├── has SecurityLogs (login history, suspicious activity)
  ├── has CalendarEvents (reminders, deadlines)
  └── has ActivityLogs (action history)
```

### Cross-Module Event Flow

```
Property rent becomes overdue
  → Alert created (AlertType: rent_overdue)
  → Notification sent to user
  → AI Notification Center displays suggestion
  → Activity log records the event
  → Security log if suspicious (optional)
```

```
Invoice marked as paid
  → Transaction created in linked Wallet
  → Business totalRevenue updated
  → Activity log updated
  → Client notified via PortalMessage
```

---

## 17. Security & Permissions

### Frontend Layers

1. **`AuthGuard`** — blocks unauthenticated access to all dashboard routes
2. **`RoleGuard`** — blocks unauthorized role access to admin/client portals
3. **API interceptor** — auto-injects JWT, handles 401 globally

### Backend Layers

1. **`auth.middleware.js`** — verifies JWT, attaches `req.user`
2. **`authorize.middleware.js`** — checks `req.user.role` against allowed roles
3. **`permissions.middleware.js`** — granular permission checks
4. **`tenant.middleware.js`** — workspace isolation via `x-workspace-id` header
5. **`documentSecurity.middleware.js`** — document access control
6. **`audit.middleware.js`** — records sensitive operations
7. **`security.middleware.js`** — rate limiting, suspicious detection
8. **`limits.middleware.js`** — request size limits

### Session Security

- Tokens stored XOR+Base64 encrypted in localStorage
- No tokens in cookies (simplifies CSRF concerns)
- Account lockout after 5 failed login attempts (15-minute lock)
- `lockedUntil` field in User model

---

## 18. The 403 Access Denied Problem

### Why Users Get 403 After Login

A 403 "Access Denied" means the user **authenticated successfully** but doesn't have the **correct role** for the portal they're trying to access.

**Common scenarios:**

#### Scenario 1: Regular user tries to access admin portal
```
User logs in at /auth/login → role = "user"
Navigates to /admin/dashboard
RoleGuard checks: allowedRoles = ['superadmin', 'admin']
user.role = 'user' → NOT in allowedRoles
→ 403 Access Denied shown
```
**Fix:** Log in at `/admin/login` with an account that has `role = admin` or `superadmin`.

#### Scenario 2: Client tries to access main dashboard
```
Client logs in at /client/login → role = "client"
Tries to navigate to /dashboard
AuthGuard: isAuthenticated = true → PASSES (any role)
Main dashboard renders — but sidebar looks wrong
```
**Fix:** Client accounts should only use `/client/*` routes. The `RoleGuard` on client routes correctly blocks non-clients.

#### Scenario 3: Wrong login page
```
Admin uses /auth/login (main app login)
Gets redirected to /dashboard (main app)
Navigates to /admin/dashboard
→ Gets stuck in RoleGuard if role check is mismatch
```
**Fix:** Each portal has its own login page. Always use the matching login URL.

### Role Assignment

Roles are set at the database level in the `users` table. Default signup role is `user`. To create an admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
Or use the admin panel at `/admin/users` to change roles.

---

## 19. Why the Project Became Unstable

### Root Causes (Historical Analysis)

#### 1. Duplicate Systems Created by AI Platforms
Multiple AI coding sessions generated duplicate implementations of the same systems. Most critically:
- A rogue `client/providers/` directory was created alongside the canonical `client/components/providers/`
- `client/providers/SocketProvider.tsx` was a duplicate of `client/components/providers/SocketProvider.tsx`
- `hooks/useSocketEvent.ts` imported from the rogue path `../providers/SocketProvider`
- When the canonical path was built, the rogue chunk ID became invalid → **`Cannot find module './1682.js'`**

#### 2. Corrupted `.next/` Cache
Stale webpack chunks referenced modules that no longer existed at their original paths. The fix is always: delete `.next/` before fresh starts.

#### 3. Auth Hydration Race Condition
`secureStorage.getItem()` used `atob()` which throws on corrupted/old format data. If it threw, `onRehydrateStorage` received `undefined` and never called `setHydrated()`. The `AuthGuard` then showed the loading screen forever.

#### 4. Unauthenticated React Query Requests
`WorkspaceSwitcher` fired `GET /api/workspaces` immediately on mount without checking `isAuthenticated`. This caused 401 errors during the loading screen, triggering React Query's retry loop.

#### 5. Inconsistent Navigation Definitions
Multiple modules hardcoded navigation arrays instead of using `config/navigation.ts`. When nav items were added in one place but not another, the mobile and desktop sidebars drifted out of sync.

---

## 20. Platform Stabilization Rules

### 🚫 DO NOT

| Rule | Reason |
|---|---|
| Create a second auth store | `store/authStore.ts` is canonical. One source of truth. |
| Create a second API client | `lib/api/index.ts` is canonical. It handles auth headers automatically. |
| Create duplicate providers | All providers live in `components/providers/`. Never `providers/` at root. |
| Add nav items outside `config/navigation.ts` | Desktop, mobile, and collapsed sidebar all read from here. |
| Fire React Query without `enabled: isAuthenticated` | Causes 401 loops during loading screen. |
| Bypass `AuthGuard` | Never render protected content without going through the guard. |
| Create a new Sidebar component | Extend `Sidebar.tsx`, `AdminSidebar.tsx`, or `ClientSidebar.tsx`. |
| Duplicate Prisma models | One model per concept. Add fields to existing models. |
| Register routes outside `app.js` | Use `safeLoad()` pattern to mount new route modules. |

### ✅ ALWAYS

| Rule | Example |
|---|---|
| Import socket from canonical path | `@/components/providers/SocketProvider` |
| Guard workspace queries | `enabled: isAuthenticated` |
| Clear `.next/` on module corruption | `Remove-Item -Recurse -Force .next` |
| Use `useAuthStore` for auth state | Never create a React Context for auth |
| Add nav items to `config/navigation.ts` | Add one entry, it propagates everywhere |
| Use `api` from `lib/api` | Never create a new axios instance |
| Use `secureStorage` for sensitive localStorage | Never `localStorage.setItem` for tokens |
| Test with `npm run build` before shipping | Catches broken imports before deployment |

---

## 21. How to Safely Extend VaultEXP

### Adding a New Dashboard Module

1. **Create the page:**
   ```
   client/app/(dashboard)/my-module/page.tsx
   ```

2. **Add to navigation:**
   ```typescript
   // config/navigation.ts → MAIN_NAV array
   { label: 'My Module', href: '/my-module', icon: MyIcon }
   ```

3. **Create components** (optional):
   ```
   client/components/my-module/MyModuleComponent.tsx
   ```

4. **Create API route** (backend):
   ```
   server/src/modules/my-module/my-module.routes.js
   server/src/modules/my-module/my-module.service.js
   server/src/modules/my-module/my-module.controller.js
   ```

5. **Register in app.js:**
   ```javascript
   app.use('/api/my-module', safeLoad('./modules/my-module/my-module.routes'));
   ```

6. **Add Prisma model** (if new data):
   ```prisma
   model MyModel {
     id        String @id @default(cuid())
     userId    String @map("user_id")
     // ...
     user User @relation(fields: [userId], references: [id])
     @@map("my_models")
   }
   ```
   Then: `cd server && npx prisma db push`

### Adding a New Admin-Only Feature

1. Create page in `app/(admin)/admin/my-feature/page.tsx`
2. The `RoleGuard` on the `(admin)` route group handles access control automatically
3. Add route in `server/src/admin/` directory
4. Register in `app.js` under `/api/admin/`

### Adding a New Client Portal Feature

1. Create page in `app/(client)/client/my-feature/page.tsx`
2. The `RoleGuard` on the `(client)` route group handles access control
3. Add route in `server/src/modules/client/` or `server/src/modules/portal/`

### Adding a New AI Feature

1. Expose endpoint at `POST /api/ai/my-feature`
2. Connect in frontend via `api.post('/api/ai/my-feature', { ... })`
3. Respect workspace isolation — backend must scope AI context to `req.workspaceId`

---

## Appendix: Common Development Commands

```bash
# Start backend server
cd server && npm run dev

# Start frontend dev server (runs on :3000, :3001 if busy)
cd client && npm run dev

# Clear corrupted Next.js build cache
cd client && Remove-Item -Recurse -Force .next

# TypeScript type check (0 errors = good)
cd client && npx tsc --noEmit

# Production build validation
cd client && npm run build

# Prisma operations
cd server && npx prisma studio     # Database viewer
cd server && npx prisma generate   # After schema changes
cd server && npx prisma db push    # Apply schema to database

# Check backend health
curl http://localhost:5000/health
```

---

## Appendix: Environment Variables

### Frontend (`client/.env`)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`server/.env`)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=mysql://user:pass@localhost:3306/vaultexp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
REDIS_URL=redis://localhost:6379   # Optional — automation queue only
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Appendix: Demo Credentials

Use these credentials to access the different portals and test the RBAC capabilities:

| Role | Portal Login URL | Email | Password |
|---|---|---|---|
| **Super Admin** | `/admin/login` | `superadmin@vaultexp.com` | `Password123!` |
| **Platform Admin** | `/admin/login` | `admin@vaultexp.com` | `Password123!` |
| **Client** | `/client/login` | `client@vaultexp.com` | `Password123!` |
| **User (Demo)** | `/auth/login` | `demo@vaultexp.com` | `Password123!` |

> **Note:** Each user must log in through their specific portal URL to avoid 403 Access Denied errors due to role mismatch.

---

*Last updated: May 2026 — Generated from live codebase analysis.*
*Maintain this document when making architectural changes.*
