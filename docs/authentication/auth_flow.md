# Authentication System & Flow

VaultEXP implements a **stateless, JWT-based authentication system** mapped to encrypted browser storage and secured on the backend via express verification chains and route-specific guards.

---

## 1. Credentials Handshake & Token Storage

### Authentication Lifecycle Flow

```
   [User Inputs Credentials]
               │
               ▼
   POST /api/auth/login
               │
               ▼
   [Express: auth.service.js]
     - bcrypt verification
     - Generate JWT Access Token
               │
               ▼
   Response: { accessToken: "eyJ..." }
               │
               ▼
   [Zustand authStore: login()]
     - Base64 XOR Encryption
     - Save in localStorage ("vault-auth-storage")
               │
               ▼
   Redirect -> /dashboard
```

### Access Token Generation
On login or signup, the backend signing service (`tokenUtils.js`) generates a JWT access token:
*   **Payload:** Includes User ID, Email, and Role.
*   **Signature:** Signed with `JWT_SECRET` key using HMAC SHA-256.
*   **Expiration:** Set to 7 days by default (`JWT_EXPIRES_IN=7d`).

### Client-Side Persistent Storage
Tokens are stored inside `localStorage` under the key `vault-auth-storage`.
To prevent inspection from malicious browser scripts, VaultEXP uses an encryption wrapper (`secureStorage.ts`) applying a lightweight XOR operation and Base64 conversion on all storage entries before write.

---

## 2. Token Hydration & Axios Interceptor

### Zustand Hydration Cycle
Zustand restores state asynchronously on startup. Components referencing auth state before hydration completes will read blank user payloads, triggering incorrect redirect loops.

To prevent this:
1.  **Hydration Indicator:** `authStore` includes `isHydrated: false`.
2.  **App Wrapper:** `AuthProvider.tsx` sets `setHydrated()` on mount.
3.  **Loading Guard:** `AuthGuard.tsx` holds a loading skeleton screen until `isHydrated === true`. If hydration fails to complete within 2 seconds, it times out to avoid freezing the app.

### Axios Interceptor Setup
The Axios network client (`lib/api/index.ts`) intercepts outbound network actions:
*   Decodes the encrypted localStorage string.
*   Extracts the token.
*   Injects the `Authorization` header: `Authorization: Bearer <token>`.
*   Injects the active workspace: `x-workspace-id: <workspaceId>`.

---

## 3. Backend Middleware & Guards

```
   Request hit API endpoint (e.g. GET /api/business)
                         │
                         ▼
        [Middleware: auth.middleware.js]
            Decodes & validates JWT
                         │
                         ▼
        [Middleware: tenant.middleware.js]
          Injects req.workspaceId parameter
                         │
                         ▼
       [Middleware: authorize.middleware.js]
          Validates req.user.role rights
                         │
                         ▼
             Execute Route Controller
```

### JWT Verification Middleware (`auth.middleware.js`)
*   Extracts header token: `req.headers.authorization`.
*   Verifies signature using `JWT_SECRET`.
*   If valid: binds `req.user = decodedToken`.
*   If invalid: returns `401 Unauthorized`.

### Role Middleware (`authorize.middleware.js`)
Guards administrative or client endpoints:
```javascript
// Usage example inside routing declarations
router.get('/admin/users', protect, authorize('admin', 'superadmin'), handler);
```
Checks if the decoded role matches allowed privileges, throwing a `403 Forbidden` on role mismatch.
