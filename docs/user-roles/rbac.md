# Role-Based Access Control (RBAC) System

VaultEXP employs a strict **Role-Based Access Control (RBAC)** design pattern to govern user privileges, restrict layout rendering, and authorize database actions.

---

## 1. System Roles Directory

The database enures roles using the `UserRole` enum inside Prisma:

*   **`SUPER_ADMIN`:** Full administrative control. Accesses platform-wide financial audits, metrics gauges, and subscription tiers modifications.
*   **`ADMIN`:** Platform staff member. Handles support tickets, checks security logs, and manages client user states.
*   **`USER`:** Workspace Owner (Business Owner, Portfolio Investor). Full control over their active workspaces (Properties, Transactions, Invoices, CRM Pipelines).
*   **`TEAM_MEMBER`:** Collaborative workspace worker. Subject to edit boundaries configured by the Workspace Owner (`USER`).
*   **`CLIENT`:** External client invited by a host. Strictly locked to the blue Client Portal shell. Can only view documents, sign agreements, pay invoices, and direct message their host.

---

## 2. Capabilities Matrix

| Feature Domain | Superadmin | Admin | User | Team Member | Client |
|---|---|---|---|---|---|
| **Platform Revenue Metrics** | ✅ Read/Write | ✅ Read | ❌ | ❌ | ❌ |
| **System Security Logs** | ✅ Read | ✅ Read | ❌ | ❌ | ❌ |
| **Multi-Tenant Workspaces** | ✅ Read/Write | ❌ | ✅ Read/Write | ✅ Read | ❌ |
| **Wallets & Ledgers** | ✅ Audit Read | ❌ | ✅ Read/Write | ✅ Read/Write | ❌ |
| **CRM Pipelines & Deals** | ❌ | ❌ | ✅ Read/Write | ✅ Read/Write | ❌ |
| **Rental Properties & Leases**| ❌ | ❌ | ✅ Read/Write | ✅ Read/Write | ❌ |
| **Client Portal Shared Docs** | ❌ | ❌ | ✅ Read/Write | ✅ Read/Write | ✅ Read-Only |
| **Support Ticket Requests** | ✅ Resolve | ✅ Resolve | ✅ Create | ✅ Create | ❌ |

---

## 3. UI Shell Scoping & Redirection guards

Frontend route groups use layout-specific guards:

### Admin Portal Protection (`(admin)/layout.tsx`)
```typescript
<RoleGuard allowedRoles={['superadmin', 'admin']} loginUrl="/admin/login">
  <AdminShell>{children}</AdminShell>
</RoleGuard>
```

### Client Portal Protection (`(client)/layout.tsx`)
```typescript
<RoleGuard allowedRoles={['client']} loginUrl="/client/login">
  <ClientShell>{children}</ClientShell>
</RoleGuard>
```

### Main App Portal Protection (`(dashboard)/layout.tsx`)
Standard users pass through `AuthGuard.tsx` which validates basic login presence without restricting standard roles. However, if a client user logs in and attempts to access `/dashboard`, the sidebar rendering logic automatically blocks Main App links.

---

## 4. Backend Request Authorization

On the server, endpoints run validation middlewares sequentially:
```javascript
const protect = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/authorize.middleware');

// Protect and limit access to system administrators
router.get('/audit-logs', protect, authorize('admin', 'superadmin'), controller.getLogs);
```

### Authorization Middleware Logic
1.  `protect` decodes JWT and populates `req.user = { id, role }`.
2.  `authorize(...allowedRoles)` intercepts execution.
3.  If `allowedRoles.includes(req.user.role)` is true, execution passes to the controller handler.
4.  Otherwise, throws a `403 Forbidden` response, preventing unauthorized access.
