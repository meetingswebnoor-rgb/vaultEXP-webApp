# Portal Isolation & Shell Architecture

VaultEXP divides its user interface into **three completely isolated front-end portals**. This isolation ensures role-based UI scoping, eliminates cross-tenant data leakage in the browser, and provides tailored user experiences.

---

## 1. Portal Matrix

The application handles routing groups to dispatch layouts and guards:

| Portal | Target User | Route Group | Accent Color | Sidebar Config | Route Guard |
|---|---|---|---|---|---|
| **Main App** | Business Owners, Investors | `(dashboard)` | Green (`#00FF88`) | `MAIN_NAV` | `AuthGuard` (isAuthenticated) |
| **Admin Portal** | Platform Admins, Superadmins | `(admin)` | Dark Red (`#EF4444`) | Admin-only links | `RoleGuard` (admin, superadmin) |
| **Client Portal** | Guest Clients, Renters | `(client)` | Blue (`#2563EB`) | Client-only links | `RoleGuard` (client) |

---

## 2. Redirection & Guard Routing Flow

When a user accesses any portal, the system enforces isolation at the route layout level:

```
                  User hits Route: /admin/dashboard
                               │
                               ▼
               Is Zustand Auth Store Hydrated?
                     ├── NO  --> Render Premium Loading Screen
                     └── YES
                               │
                               ▼
                    Is User Authenticated?
                     ├── NO  --> Redirect to /admin/login
                     └── YES
                               │
                               ▼
                 Check Allowed Roles in Route Guard
                     ├── Mismatch --> Render 403 Access Denied
                     └── Match
                               │
                               ▼
                     Render Portal Layout
```

*   **AuthGuard (`client/components/guards/AuthGuard.tsx`):** Protects routes within the `(dashboard)` group. Allows any authenticated session, regardless of role.
*   **RoleGuard (`client/components/guards/RoleGuard.tsx`):** Enforces explicit role checks. For example, `(admin)/layout.tsx` embeds `<RoleGuard allowedRoles={['superadmin', 'admin']}>` and redirects non-admins to `/admin/login`.

---

## 3. AppShell Responsive Layout Dispatcher

The Main App shell dispatcher (`AppShellInner.tsx`) dynamically selects layouts based on window viewport width via a custom hook (`useBreakpoint`):

```typescript
const { isReady, isMobileOrTablet } = useBreakpoint();

if (!isReady) return <LayoutSkeleton />; // Prevents Hydration Mismatch

return isMobileOrTablet
  ? <MobileDashboard>{children}</MobileDashboard>
  : <DesktopDashboard>{children}</DesktopDashboard>;
```

### Desktop Layout (`DesktopDashboard.tsx`)
*   **Fixed Sidebar:** Expands to `260px` or collapses to `80px`. Contains the workspace switcher, navigation items, and theme selectors.
*   **Content Container:** Main panel styled with glassmorphism and subtle background gradients (`bg-gradient-to-br`).
*   **AI Side Panel:** Toggled via context (`useAppShell()`). Slides in from the right to reveal chat feeds.

### Mobile Layout (`MobileDashboard.tsx`)
*   **MobileHeader:** Header with notifications and workspace selector.
*   **MobileBottomNav:** Floating action navigation containing five priority tabs.
*   **MobileQuickActionsFAB:** Prominent bottom-right Floating Action Button for triggers (add invoice, upload document, record transaction).

---

## 4. White-Label & Custom Branding Layouts

The system supports real-time layout overrides based on workspace configurations:
1.  On mounting, `WorkspaceSwitcher` queries `GET /api/workspaces`.
2.  If workspace-specific branding exists (`WorkspaceBranding` table), the layout updates CSS variables dynamically:
    *   `--ws-primary`: Primary accent color (default: `#00FF88` for standard users).
    *   `--ws-sidebar`: Background color of the navigation sidebar.
    *   `--ws-ai-name`: Name label shown inside the AI Assistant header.
