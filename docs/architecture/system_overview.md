# Platform Architecture - System Overview

This document provides a highly detailed technical breakdown of the systems architecture, technological choices, and system-level directory topologies of the **VaultEXP** platform.

---

## 1. System Topology

VaultEXP operates on a **Single-Codebase, Decoupled Client-Server SaaS model** supporting multi-tenancy at the workspace level.

```
                  ┌─────────────────────────────────┐
                  │          Client Browser         │
                  │   Next.js 14 Web / Mobile Apps  │
                  └────────┬───────────────▲────────┘
                           │               │
            HTTPS REST APIs│               │Websockets
            x-workspace-id │               │(Real-time sync)
            Authorization  │               │
                           ▼               │
                  ┌────────────────────────┴────────┐
                  │       Express.js Server         │
                  │   Node.js Routing & Services    │
                  └────────┬───────────────┬────────┘
                           │               │
                    ORM    │               │Queue Tasks
             Prisma Client │               │BullMQ
                           ▼               ▼
                  ┌────────┴────────┐   ┌──┴────────┐
                  │   MySQL DB      │   │  Redis    │
                  │  SaaS Schemas   │   │ Job Queue │
                  └─────────────────┘   └───────────┘
```

---

## 2. Comprehensive Tech Stack

### Frontend Application (`/client`)

*   **Core Framework:** Next.js 14 (App Router) employing React 18, leveraging Client Components for interactive forms and Server Components for structural templates.
*   **State Management:**
    *   *Global State:* **Zustand** with persistent storage middleware. Configured with a custom localStorage adapter to encrypt state keys.
    *   *Server Cache:* **TanStack Query (React Query v5)** handles query caching, background polling, and optimistic UI updates.
*   **Styling & UI Library:** Tailwind CSS combined with CSS variables for dynamic workspace branding. Framer Motion drives fluid sidebar transitions and orb animations. Lucide React provides modern vector iconography.
*   **Network Client:** Axios instance custom-configured with request and response interceptors to automatically inject headers (`Authorization` and `x-workspace-id`) and catch token expiration exceptions.
*   **Realtime Interface:** `socket.io-client` establishing connections upon authentication.

### Backend Application (`/server`)

*   **Runtime Engine:** Node.js v18+ running an Express.js API framework.
*   **Database ORM:** Prisma 6 configured with a MySQL client.
*   **Authentication & Security:** JWT-based stateless tokens. Hashing is performed via `bcryptjs`. Headers are reinforced via `helmet`, and request validation is controlled by Zod/Express-validators.
*   **Realtime Server:** `socket.io` integrated into the Express HTTP listener.
*   **Job Processing:** BullMQ running over Redis to schedule cron executions and process intensive document OCR tasks asynchronously (optional/disabled during development mode).
*   **Image/Asset Store:** Cloudinary connected via Multer middleware.
*   **Subscription Gateway:** Stripe API integration handling subscriptions and webhook confirmations.

---

## 3. High-Level Workspace Isolation

Every resource in the database belongs directly to a **Workspace** (excluding core platform management schemas like SaaSPlans).
To ensure multi-tenant security:
1.  On the frontend, the selected workspace ID is retrieved from the workspace switcher and saved in `localStorage` as `vault-workspace-id`.
2.  The Axios interceptor extracts this ID and attaches it to every request header: `x-workspace-id`.
3.  The backend routes pass through a custom `tenant.middleware.js` that checks for `req.headers['x-workspace-id']`.
4.  This tenant ID is attached to the request object: `req.workspaceId = headerId`.
5.  All subsequent database actions execute with a filter: `where: { workspaceId: req.workspaceId }`.

---

## 4. Key Directory Topography

Below is the directory map of the codebase detailing the primary function of each folder:

### Frontend Directory Structure

```
client/
├── app/                      # Next.js App Router folders
│   ├── (admin)/              # Red-themed administration routes
│   ├── (client)/             # Blue-themed client sharing portal
│   ├── (dashboard)/          # Green-themed main workspace routes
│   ├── auth/                 # Login/Signup forms
│   └── portal/               # Legacy portal routes
├── components/
│   ├── ai/                   # VaultAI floating widget & sidebars
│   ├── guards/               # AuthGuard & RoleGuard route protections
│   ├── providers/            # Canonical Providers tree (Socket, Query, Theme)
│   ├── shell/                # AppShell wrappers for Desktop and Mobile
│   └── ui/                   # Reusable atomic UI elements
├── hooks/                    # useSocketEvent, useBreakpoint, useAuth custom hooks
├── lib/                      # Axios clients, storage managers, utility classes
├── store/                    # Zustand persistent stores (authStore, liveStore)
└── types/                    # Shared TypeScript interfaces
```

### Backend Directory Structure

```
server/
├── prisma/                   # schema.prisma schema definition & seed scripts
└── src/
    ├── admin/                # Admin-specific routes
    ├── ai/                   # AI LLM prompt builders & OCR services
    ├── config/               # Database and API environment variables
    ├── middleware/           # auth, audit, limits, and tenant scopes
    ├── modules/              # Submodules matching Prisma entities
    │   ├── financial/        # Ledger entries, invoices, and expenses
    │   ├── crm/              # Pipelines, deal stages, and note logging
    │   ├── document/         # Multer, folder structures, and vault actions
    │   └── automation/       # Trigger engine configurations
    ├── socket/               # Websocket namespace broadcast handlers
    ├── app.js                # CORS definitions & middleware orders
    └── server.js             # Runtime entrypoint bootstrapping the server
```
