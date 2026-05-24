# Workflows & Data Flows

This document details the cross-module event flows, background tasks, and trigger chains that maintain data consistency and automate workflows across VaultEXP.

---

## 1. Cross-Module Lifecycle Sequences

VaultEXP leverages database triggers, application hooks, and WebSocket broadcasts to execute workflows automatically. Below are the execution patterns for two critical system scenarios.

### Scenario A: Rental Payment Overdue Flow

When a rental period closes and the tenant hasn't paid rent:

```
┌────────────────────────────────┐
│  Automation Engine (BullMQ)    │
│  Daily Cron checks RentRecords  │
└───────────────┬────────────────┘
                │
                ▼ (Rent Record Status is OVERDUE)
┌────────────────────────────────┐
│    Database Writes (Prisma)    │
│  1. Create Alert (rent_overdue)│
│  2. Create Notification        │
│  3. Log CRMActivity on Tenant  │
└───────────────┬────────────────┘
                │
                ├─────────────────────────────────────────┐
                ▼ (Real-time Broadcast)                   ▼ (Asynchronous)
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Socket.io Channel Emission   │       │      Email Notification        │
│  Workspace notification updates│       │  Sends warning to Tenant & Host│
└────────────────────────────────┘       └────────────────────────────────┘
```

#### Detailed Execution Sequence:
1.  **Job Trigger:** A cron process running inside the automation engine checks monthly lease templates.
2.  **Status Scan:** If today's date exceeds `dueDate` and `status !== 'paid'`, the record updates:
    *   `RentRecord.status = 'overdue'`.
3.  **Data Generation:** The backend controller inserts an `Alert` entity:
    *   `type: 'rent_overdue'`, `priority: 'high'`, `workspaceId: tenant.workspaceId`.
4.  **Logging & AI:** Writes an entry in `ActivityLog`: "Rent record for property [Name] marked overdue." The AI Notification Center prioritizes this alert during the next context compile.
5.  **Notifications:** The backend notifies the user's browser via the workspace socket room (`workspace_<id>`), triggering the notification banner.

---

### Scenario B: Invoice Payment & Wallet Ledger Synchronization

When a business invoice is marked as paid:

```
                         Invoice marked as PAID
                                   │
                                   ▼
                   Update Invoice.status = 'paid'
                                   │
                                   ▼
                  Create Transaction (type: 'income')
                                   │
                                   ▼
             Update Wallet.balance (add Transaction.value)
                                   │
                                   ▼
             Generate LedgerEntry (double-entry reference)
                                   │
                                   ▼
       ┌───────────────────────────┴───────────────────────────┐
       ▼ (Socket.io)                                           ▼ (Portal)
  Broadcast to workspace                                 Send PortalMessage
  "Revenue update: $X"                                   "Invoice paid thank you"
```

#### Detailed Execution Sequence:
1.  **Trigger Event:** A customer makes a payment via credit card (Stripe Webhook triggers `/api/webhooks/stripe`) or a landlord marks an invoice as paid manually (`POST /api/financial/invoices/[id]/pay`).
2.  **Invoice Update:**
    *   Updates the `Invoice` status to `paid`.
    *   Generates a `Payment` transaction receipt in the database.
3.  **Accounting Ledger Execution:**
    *   Inserts a new `Transaction` record:
        *   `amount: invoice.total`, `type: 'income'`, `businessId: invoice.businessId`.
    *   Fetches the target `Wallet` associated with the business.
    *   Increases `Wallet.balance = Wallet.balance + Transaction.amount`.
    *   Creates a `LedgerEntry` record:
        *   `credit: Transaction.amount`, `balance: New Wallet Balance`, `memo: "Payment for Invoice #[Number]"`.
4.  **Team Notification:** Emits a socket payload to notify members of the updated workspace cash flow.
5.  **Client Notification:** Inserts a `PortalMessage` in the Client Portal conversation: "Invoice #[Number] payment of $X confirmed."

---

## 2. Platform Activity Logs & Auditing

Every database change triggers an audit log record:
*   **Activity Logs (`ActivityLog`):** Logs functional actions (e.g., `CREATE`, `UPDATE`, `DELETE`, `UPLOAD`) alongside details and JSON payloads showing exactly what changed.
*   **Security Logs (`SecurityLog`):** Logs authentication changes (`LOGIN`, `LOGIN_FAILED`, `PERMISSION_CHANGE`, `SUSPICIOUS_ACTIVITY`) alongside client metadata (IP address, User Agent).
*   **Audit Middleware (`audit.middleware.js`):** Intercepts database writes in sensitive modules (e.g., wallets, admin scopes) to write log records automatically, securing the workspace audit trail.
