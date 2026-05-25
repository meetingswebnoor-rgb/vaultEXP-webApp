# Frontend Architecture (Next.js 14 & Zustand)

The frontend application is built inside the `/client` directory using **Next.js 14 (App Router)** and TypeScript. This document details routing layouts, global state persistence, network caching policies, and UI shells.

---

## 1. Directory Organization & Router Layouts

The project uses Next.js route groups to isolate portals and avoid styling collisions:

```
client/app/
├── (admin)/              # Admin routes guarded by AdminShell
│   ├── admin/            # Core admin dashboard
│   └── layout.tsx        # Integrates Admin RoleGuard
├── (client)/             # Client sharing portal routes
│   └── layout.tsx        # Integrates Client RoleGuard
├── (dashboard)/          # Main app workspace routes
│   ├── dashboard/        # Main landing overview
│   └── layout.tsx        # Integrates AuthGuard & AppShell
├── auth/                 # Public auth pages (login, signup)
├── layout.tsx            # Global root layout providing HTML body
└── page.tsx              # Public home page
```

---

## 2. State Management Strategy

VaultEXP splits state management into **local UI state**, **persistent global state**, and **asynchronous server state**.

### Global UI State (React Context)
*   **AppShellContext:** Manages temporary UI parameters:
    *   Sidebar expansion toggle (`collapsed` state).
    *   Mobile drawer overlay states.
    *   Floating AI orb open/close toggle.
    *   Active Workspace sidebar items visibility.

### Persistent State (Zustand)
*   **authStore.ts:** The single source of truth for authentication. Stores access token strings, user profiles, and the hydration state flag (`isHydrated`). Uses the custom XOR `secureStorage` to persist auth details in browser storage.
*   **syncStore.ts:** Queue storage tracking offline mobile actions to push upon reconnect.

### Server State Cache (TanStack Query)
Managed inside `Providers.tsx` using TanStack Query v5:
```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // Aggressive 5 minutes caching
      gcTime: 30 * 60 * 1000,      // Garbage collect after 30 mins
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 401/403/404 errors
        if ([401, 403, 404].includes(error?.status)) return false;
        return failureCount < 3;
      }
    }
  }
})
```

---

## 3. Custom Hooks Reference

*   **`useAuth`:** Wrapper reading state from `authStore` to quickly return `user`, `role`, and `isAuthenticated` states.
*   **`useBreakpoint`:** Reads viewport size to return boolean indicators like `isMobileOrTablet` to dispatch layouts.
*   **`useSocketEvent`:** Connects to the workspace socket context to listen for events and trigger React Query cache invalidations.

---

## 4. Single Source of Truth Navigation

All sidebars and bottom navigation elements import layout labels from [navigation.ts](file:///C:/Users/meeti/Downloads/VaultWebApp/client/config/navigation.ts):
```typescript
export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Businesses', href: '/business', icon: TrendingUp },
  { label: 'Properties', href: '/property', icon: Building2 },
  ...
];
```
This guarantees that desktop and mobile sidebar listings stay perfectly in sync.
