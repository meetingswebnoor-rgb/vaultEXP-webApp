# AI Systems & Contextual Assistant (VaultAI)

VaultEXP integrates a context-aware Large Language Model (LLM) assistant, named **VaultAI**, across its dashboard portals. This document details the prompts, memory storage, workspace isolation, and specific sub-AI implementations.

---

## 1. System Architecture

VaultAI uses a context-injection pattern:

```
   User inputs prompt -> [Frontend: VaultAISidebar]
                                │
                                ▼
                 Fetch Current Page Data (JSON)
                                │
                                ▼
             POST /api/ai/chat (x-workspace-id header)
                                │
                                ▼
              [Backend: tenant.middleware.js]
             Validates active workspace boundary
                                │
                                ▼
            [Prompt Compiler: server/src/ai/...]
           - Inject system safety rules
           - Inject page context JSON
           - Inject conversation history
                                │
                                ▼
                     Call OpenAI / LLM API
                                │
                                ▼
               Return Structured Markdown to User
```

---

## 2. Dynamic Context-Injection & Prompts

### Core Context compilation
Unlike generic chat engines, VaultAI reads page states:
*   If the user is on `/property`, the system packages property lists, tenant counts, and active repair tickets into a context JSON string.
*   If the user is on `/crm`, the prompt compiles deal pipeline velocity details.

### System Prompt Directive
The core system prompt instructs the assistant on limits:
```markdown
You are VaultAI, the senior system assistant for VaultEXP.
1. You only answer questions using the workspace context JSON provided.
2. If the user asks about data outside the workspace context, politely decline.
3. Keep answers technical, structured in Markdown, and action-oriented.
```

---

## 3. Workspace Data Isolation (CORS/Cross-Tenant Prevention)

Data isolation is enforced programmatically before any context reaches the LLM API:
1.  The client request passes through the Express `tenant.middleware.js` to set `req.workspaceId`.
2.  The database query forces scoping:
    ```javascript
    const activeData = await prisma.wallet.findMany({
      where: { workspaceId: req.workspaceId }
    });
    ```
3.  Only the returned records from the query populate the AI context. This prevents users from injecting prompts to query other users' data, preventing cross-tenant leakage.

---

## 4. Specific AI Submodules

### A. AI Financial Advisor (`/financial/advisor`)
*   **Purpose:** Cash flow analytics.
*   **Behavior:** Analyzes the `Transaction` and `LedgerEntry` tables, evaluates income/expense category percentages, and outputs monthly budget optimization suggestions.

### B. Business AI Insights (`/business/ai-insights`)
*   **Purpose:** Business operation metrics review.
*   **Behavior:** Reviews invoice durations (average days unpaid), outstanding customer balances, and projects Q3 revenue.

### C. Document OCR & Chat (`/documents`)
*   **Purpose:** Interacting with PDFs and contract scans.
*   **Behavior:** When files are uploaded, BullMQ runs OCR. The text saves in `DocumentAIAnalysis.ocrText`. The document chat sidebar queries this OCR text, allowing conversational analysis of the document (e.g. "What is the expiration date of this lease agreement?").

---

## 5. Fallback Mechanisms & Offline Mode

In development environments or when LLM API keys are unconfigured:
*   The system uses local heuristic rule matching.
*   If a user asks about balance totals, the backend counts database values and generates a templated response: *"Your total balance is $X. The LLM integration is currently in offline mode."*
*   Prevents app crashes on API key configuration issues.
