# Automation Engine (BullMQ & Redis)

VaultEXP incorporates a background automation engine designed to execute recurring tasks, orchestrate data synchronization workflows, and process intensive file jobs asynchronously.

---

## 1. Automation Architecture

To maintain API performance, long-running processes (e.g., invoice generation, document OCR parsing, calendar alert evaluation) are decoupled from the main HTTP request/response thread:

```
    Web Request (e.g., Upload File)
                  │
                  ▼
         [API Route Controller]
         Saves file metadata -> Database
         Enqueues Job payload in Redis Queue
                  │
                  ▼ (Response returned immediately to client)
         [Redis Transport Layer]
                  │
                  ▼ (Pulls job payload)
        [BullMQ Worker Thread]
         Processes OCR / AI indexing
         Updates Database with results
                  │
                  ▼
      Emits Realtime Finish Alert via Socket.io
```

---

## 2. Queue Architecture & BullMQ Configuration

The engine uses **BullMQ** managed by a **Redis** data store. BullMQ handles task queuing, scheduling, priority ordering, and concurrent processing.

### Key Queues
*   `document-processing`: Processes file OCR, parses text extracts, and maps layout structures.
*   `invoice-automation`: Handles recurring invoice generation and billing deadline evaluations.
*   `alerts-notification`: Dispatches batch email notifications and pushes calendar event reminders.

### Development Configuration
To simplify local developer setup, BullMQ operations are optional:
*   In **production** (`NODE_ENV=production`), jobs require a valid `REDIS_URL` connection.
*   In **development**, if Redis is absent, jobs fallback to run in-process using Node.js event listeners.

---

## 3. Recurring Schedules (Cron System)

Schedules trigger checks periodically:
*   **Daily Alerts Check:** Evaluates rental records, identifying accounts transitioning to `overdue` status.
*   **Invoice Generation Cron:** Evaluates active `Subscription` records, creating `Invoice` drafts on billing cycle dates.
*   **Audit Cleanups:** Purges or archives expired temporary document upload links.

---

## 4. Failure Recovery & Retry Logic

Background workers apply resilience policies to handle third-party service failures (e.g., Stripe API outages, OCR endpoint timeouts):
*   **Automatic Retry:** Failed queue tasks retry up to 3 times automatically.
*   **Exponential Backoff:** Retries apply a delay:
    ```javascript
    delay = Math.min(1000 * 2 ** attempt, 30000)
    ```
*   **Dead Letter Queue (DLQ):** Tasks that fail all retry attempts transition to a `failed` state. The error details are written to the `SecurityLog` with severity `CRITICAL` for admin review.
