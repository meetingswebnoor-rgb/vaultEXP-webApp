# Systems Operations & Troubleshooting Manual

This document details the operational failure modes, recovery protocols, and debugging pipelines for resolving UI inconsistencies, socket disconnections, caching bugs, and access issues.

---

## 1. The "403 Access Denied" Authentication Failure

### The Problem
A user logins successfully, but is blocked by a screen stating: *"403 Access Denied: You do not have permissions to view this resource."*

### Diagnosing Root Causes

#### Scenario A: Portal Mismatch (Wrong Login URL)
*   **Cause:** A user with role `user` logs in through `/admin/login` or a user with role `client` logs in through `/auth/login`.
*   **Resolution:** Portal configurations are strictly isolated. Users must log in via their specific URLs:
    *   Main App: `/auth/login`
    *   Admin Portal: `/admin/login`
    *   Client Portal: `/client/login`

#### Scenario B: Database Role Mismatch
*   **Cause:** The user's role in the database is incorrect.
*   **Resolution:** Verify database configurations using Prisma Studio:
    ```bash
    cd server && npx prisma studio
    ```
    Search the user record in the `users` table and verify the `role` enum matches (`USER`, `ADMIN`, `SUPER_ADMIN`, `CLIENT`).

---

## 2. Next.js Webpack Cache Corruption (`Cannot find module './XXXX.js'`)

### The Problem
During development or build pipelines, Webpack throws compilation errors like `Cannot find module './1682.js'` or duplicate chunk loading anomalies.

### Root Cause
This occurs when directories are rearranged, but Next.js imports static components from the stale `.next/` cache.
*   *Historical Example:* Duplicate SocketProviders existed in root `/providers` and `/components/providers`. When developers deleted the duplicate folder, webpack chunk mappings broke.

### Resolution
Force Next.js to purge build caches:
```powershell
# PowerShell: Purge next build caches
Remove-Item -Recurse -Force .next
npm run dev
```
```bash
# Bash: Purge next build caches
rm -rf .next
npm run dev
```

---

## 3. Persistent stuck Loading Screen (Auth Hydration Freeze)

### The Problem
The browser gets stuck on the loading indicator screen forever when trying to access `/dashboard`.

### Root Cause
The Zustand persistent state manager retrieves token details from `localStorage`. If the storage payload is corrupted, the XOR decoder throws an exception. As a result, the `onRehydrateStorage` callback never runs, and `isHydrated` remains `false`.

### Resolution
1.  **Clear local cache:** Open developer tools and run:
    ```javascript
    localStorage.clear();
    location.reload();
    ```
2.  **Safety Guard verification:** Ensure `AuthGuard.tsx` includes the 2-second fallback safety timer which forces mount hydration if the local storage handler fails.

---

## 4. TanStack Query 401 Loop Anomalies

### The Problem
Browser console displays a continuous loop of `GET /api/workspaces 401 Unauthorized` requests.

### Root Cause
Queries like `WorkspaceSwitcher` fire on page load before the Zustand auth store has rehydrated from localStorage. The Axios client fires a request without the Authorization header, getting a 401. TanStack Query's retry configuration tries again, creating a loop.

### Resolution
Ensure all queries requiring authentication declare the `enabled` parameter:
```typescript
const { data } = useQuery({
  queryKey: ['workspaces'],
  queryFn: () => api.get('/api/workspaces'),
  enabled: isAuthenticated // Injected from useAuthStore hook
});
```
