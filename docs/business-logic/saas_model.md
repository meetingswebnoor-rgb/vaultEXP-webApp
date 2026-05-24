# SaaS Subscriptions & Monetization Model

This document outlines the business positioning, tiered plans, Stripe integrations, usage tracking, and feature gating logic of the VaultEXP SaaS platform.

---

## 1. Market Positioning & Target Audience

VaultEXP is positioned as an **enterprise-grade operations portal** for:
*   **Property Developers & Landlords:** Managing commercial/residential portfolios, lease lifecycles, and tenant portal interactions.
*   **Investment Managers:** Monitoring portfolios (Stocks, Crypto, real estate assets) with AI-generated risk alerts.
*   **SaaS Businesses:** Requiring multi-tenant CRM pipelines and general ledger financial integrations.

---

## 2. Subscription Plans & Gating Rules

Monetization is driven by tiered SaaS plans defined inside the `SaaSPlan` database model:

| Plan Identifier | Price (USD) | Max Storage | Max Team Members | CRM Access | Analytics Access | Advanced Automations |
|---|---|---|---|---|---|---|
| **Starter** | $29/mo | 1 GB | 3 | ❌ | ❌ | ❌ |
| **Pro** | $99/mo | 10 GB | 10 | ✅ | ✅ | ✅ (50 runs/mo) |
| **Enterprise** | Custom | Unlimited | Unlimited | ✅ | ✅ | Unlimited |

### Feature Gating Middleware (`limits.middleware.js`)
Endpoints verify plan entitlements prior to executing queries:
1.  On request, the system retrieves the active subscription model for the user's workspace:
    ```javascript
    const sub = await prisma.subscription.findFirst({
      where: { workspaceId: req.workspaceId }
    });
    ```
2.  Validates metrics against plan ceilings:
    *   If uploading a file, checks `sub.storageUsed + fileSize <= sub.plan.maxStorage`.
    *   If running automations, validates `sub.automationRuns < sub.plan.maxAutomation`.
3.  If a ceiling is reached, the middleware returns `402 Payment Required` along with an instructions payload redirecting the user to `/settings/billing`.

---

## 3. Stripe Integration & Webhooks Flow

Subscriptions synchronize using **Stripe Billing**:

```
      User purchases Tier in /settings/billing
                         │
                         ▼
        Redirected to Stripe Checkout Page
                         │
                         ▼ (Successful Payment)
         Stripe dispatches Webhook Event:
          customer.subscription.created
                         │
                         ▼
       [API Endpoint: POST /api/webhooks/stripe]
          - Verifies Stripe signature
          - Matches customer metadata to User ID
          - Creates/updates Subscription record
                         │
                         ▼
          Updates user workspace privileges
```

### Key Stripe Webhook Events Handled
*   `customer.subscription.created` & `customer.subscription.updated`: Saves Stripe ID, price key, expiration date, and resets usage metrics (resets `aiTokensUsed` and `automationRuns` limits to `0`).
*   `customer.subscription.deleted`: Sets subscription status to `CANCELED`, restricting feature access to the free starter tier limits.
*   `invoice.payment_failed`: Marks the subscription as `PAST_DUE` and dispatches warning notifications to the workspace owner.
