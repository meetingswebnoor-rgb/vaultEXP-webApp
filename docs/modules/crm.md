# CRM System - Deep Module Documentation

The **CRM Module** provides a visual and operational framework for tracking leads, clients, sales pipelines, deals, and team interactions. It allows users to manage their sales cycles, schedule activities, and log notes, while integrating with the document vault and workspace calendars.

---

## 1. Module Overview & Business Case

For businesses operating in investment, consulting, real estate, or property development, client acquisition requires structured follow-up. The CRM module centralizes this pipeline inside VaultEXP, letting users:
1.  **Manage Contacts:** Log details for leads, clients, vendors, and partners.
2.  **Visualize Pipelines:** Track deal progression across custom stages (e.g., Lead, Contacted, Under Review, Negotiating, Won/Lost).
3.  **Track Tasks & Notes:** Associate phone calls, emails, and meetings with contacts, and utilize AI to summarize communications.

---

## 2. Technical Data Architecture & Models

The database entities are structured in `/server/prisma/schema.prisma` as:

```
                  ┌──────────────────────┐
                  │      CRMContact      │
                  │ (lead, client, vendor)│
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼ 1              ▼ *              ▼ *
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │   CRMDeal   │  │   CRMNote   │  │ CRMActivity │
     │ (open, won) │  │  (content)  │  │(task, email)│
     └─────────────┘  └─────────────┘  └─────────────┘
            │ *
            │
            │ 1
     ┌─────────────┐
     │  CRMStage   │
     │ (order, col)│
     └─────────────┘
```

*   **CRMContact:** Central contact record. Status: `new`, `contacted`, `qualified`, `unqualified`, `active`, `inactive`. Type: `lead`, `client`, `partner`, `vendor`.
*   **CRMPipeline:** Visual board configuration container.
*   **CRMStage:** Column stage on the pipeline board, configured with `order` index and `color` code.
*   **CRMDeal:** Deal record storing monetary `value`, expected close date, win probability (0-100), status (`open`, `won`, `lost`).
*   **CRMNote:** Text notes associated with contacts/deals, including an `isAiGenerated` flag for transcribed summaries.
*   **CRMActivity:** Calendar-linked interactions (Type: `call`, `email`, `meeting`, `task`).

---

## 3. Core Operational Flows

### A. Lead Ingestion & Pipeline Placement
1.  **Creation:** User adds a contact via CRM UI.
2.  **API Call:** `POST /api/crm/contacts`
3.  **Default Handling:** The backend maps the contact to the default active pipeline's first stage (Stage order: `0`).
4.  **Database Save:** Inserts a `CRMContact` record with `workspaceId` matching `req.workspaceId`.

### B. Drag-and-Drop Deal Stage Update
1.  **Trigger:** User drags a deal card from "Contacted" to "Negotiating" column on the Pipeline board.
2.  **API Call:** `PUT /api/crm/deals/[id]/stage` with body `{ stageId: "newStageCuid" }`.
3.  **Backend Execution:**
    *   Finds target `CRMDeal` and validates ownership.
    *   Updates `stageId`.
    *   Creates a `CRMActivity` entry automatically: "Deal moved to stage: [Stage Name]".
    *   If status changes to `won`, updates parent contact `type` from `lead` to `client` automatically.

---

## 4. CRM Dashboards & Metrics Engine

The CRM dashboard metrics are calculated dynamically using Prisma aggregation queries inside the backend CRM service:
*   **Sales Pipeline Value:** Sum of `value` for all `CRMDeal` records where status is `open`.
*   **Conversion Rate:** Percentage of deals where status is `won` compared to total closed deals (`won + lost`).
*   **Activity Velocity:** Active scheduled activities counts per week.
*   **Charts Data:** Return arrays mapping stages to deal counts and total value for rendering funnel diagrams on the frontend.

---

## 5. AI CRM Assistance

The VaultAI system parses contact note logs to synthesize customer status updates:
*   **Contact Summary Builder:** When viewing a contact detail, the user can click "Generate AI Summary".
*   **Backend prompt compilation:** Collects all related `CRMNote` and `CRMActivity` items, formats them into a timeline, and prompts the LLM to output a concise bullet-point summary of the relationship.
*   **Database Sync:** Writes the response into `CRMContact.aiSummary` to avoid unnecessary re-generation.
