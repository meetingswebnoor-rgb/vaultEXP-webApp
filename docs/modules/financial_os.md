# Financial OS - Deep Module Documentation

**Financial OS** is the core transaction-processing engine and accounting general ledger of the VaultEXP platform. It is engineered to replace fragmented spreadsheets, bank feeds, and traditional accounting software by consolidating personal investments, business properties, multi-currency wallets, and business invoicing into a single, cohesive double-entry ledger.

---

## 1. Module Overview & Business Case

For business owners and high-net-worth investors, financial data is often fragmented. Wallets exist in bank accounts, rental incomes exist on property management spreadsheets, and stock values live in trading accounts.

Financial OS solves this by creating:
1.  **Unified Ledger Accounts:** Wallets serve as logical ledger accounts mapping checking, savings, credit, and cryptocurrency holdings.
2.  **Double-Entry Records:** The `LedgerEntry` model represents credits and debits, ensuring that transfers, payments, and investments reconcile to the penny.
3.  **Property & Business Alignment:** Expenses and invoices link directly to specific properties or businesses, generating real-time Profit and Loss (P&L) statements.

---

## 2. Technical Data Architecture & Models

```
                  ┌──────────────────────┐
                  │       Wallet         │
                  │ (checking, crypto...)│
                  └──────────┬───────────┘
                             │ 1
                             │
                             │ *
                  ┌──────────▼───────────┐
                  │    LedgerEntry       │
                  │ (debit, credit, bal) │
                  └──────────▲───────────┘
                             │ *
                             │
                             │ 0..1
                  ┌──────────┴───────────┐
                  │    Transaction       │
                  │  (income, expense)   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │  Business   │  │  Property   │  │ Investment  │
     └─────────────┘  └─────────────┘  └─────────────┘
```

The primary models driving this module in the database are:
*   **Wallet:** Logical account storage (Type: `checking`, `savings`, `credit`, `crypto`, `cash`). Stores `balance` and currency.
*   **Transaction:** Ledger mutations containing `type` (`income`, `expense`, `transfer`), `status`, `amount`, and categorization. Relates to a `Wallet` and optionally to a `Business`, `Property`, or `Investment`.
*   **LedgerEntry:** Low-level accounting record mapping debits, credits, and current account balance for audit trails.
*   **Invoice:** Business accounts receivable. Links to `InvoiceItem` lists and records payments.
*   **Expense:** Accounts payable or operational cost records, mapped to a `FinancialCategory`.

---

## 3. Core Operational Flows

### A. Rent Record Processing Flow
1.  **Trigger:** A tenant pays rent via the portal, or the landlord manually records a rent payment.
2.  **API Call:** `POST /api/property/rent-records/[id]/pay`
3.  **Backend Controller (`property.controller.js`):**
    *   Finds the target `RentRecord` and updates `status` to `paid`.
    *   Creates a `Transaction` associated with the active workspace:
        *   Type: `income`, Category: `rent_income`, Amount: rent value.
    *   Creates a `LedgerEntry` in the target `Wallet` increasing credit and recalculating the balance.
4.  **Real-time Event:** Emits `rent_paid` event to client workspaces.

### B. Business Invoice Lifecycle
1.  **Draft:** Built on the frontend (`/invoices/builder`) using `InvoiceItem` tables. Sent to `POST /api/financial/invoices`.
2.  **Pending:** Sent to client portal. Client receives email notice with link.
3.  **Paid:** Client completes payment via Stripe (or manual check registered by landlord).
    *   Stripe webhook or manual trigger calls `POST /api/financial/invoices/[id]/pay`.
    *   Creates matching `Transaction` and `Payment` records in MySQL.
    *   Updates `Wallet` and creates corresponding `LedgerEntry`.

---

## 4. Financial AI Insights & Advisor

The `/financial/advisor` and `/business/ai-insights` pages consume transaction arrays to produce smart summaries:
*   **Data Scoping:** The AI endpoint retrieves all `Transaction` and `LedgerEntry` records filtered by `req.workspaceId` and the requested date range.
*   **Context Payload:** Sanitized numbers, categories, and descriptions are compiled into a prompt template and sent to the LLM backend.
*   **Response Generation:** The LLM evaluates debt ratios, cash flow changes, and tax deductions, returning structured suggestions:
    *   *Example Recommendation:* "Your software subscriptions have increased by 22% this quarter. Consider consolidating workspace licenses."

---

## 5. Security & Verification Rules

*   **Workspace Validation:** No ledger entry or wallet can be created or queried without the `req.workspaceId` scoping guard. Attempting to query an invalid wallet ID returns a `404 Wallet Not Found` error.
*   **Immutable Ledger Entries:** `LedgerEntry` records cannot be updated or deleted directly via API endpoints. Reversals must be executed as new offsetting debit/credit transactions, preserving the audit trail.
