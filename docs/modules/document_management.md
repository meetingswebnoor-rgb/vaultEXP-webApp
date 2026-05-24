# Document Management System - Deep Module Documentation

The **Document Management System (DMS)** handles file uploads, cloud storage mapping, directory navigation, file indexing, metadata tagging, and automated AI analysis / OCR querying for the VaultEXP workspace.

---

## 1. Module Overview & Business Case

Enterprise workspaces process large volumes of invoices, rental agreements, property deeds, tax forms, and corporate identification. Storing files in unstructured drives leads to discovery overhead.

The DMS provides:
1.  **Structure and Organization:** Nested folder systems with inherited access keys.
2.  **Compliance and Alerts:** Expiration dates trigger reminders (e.g., insurance certificates, leases).
3.  **Content Discovery:** OCR processes files, transforming PDFs and images into searchable text.
4.  **AI Q&A Interaction:** Users chat directly with single documents or folders to extract specific details.

---

## 2. Technical Data Architecture & Models

DMS utilizes the following models in `schema.prisma`:

```
                  ┌──────────────────────┐
                  │    DocumentFolder    │
                  │ (name, parentId...)  │
                  └──────────┬───────────┘
                             │ 1
                             │
                             │ *
                  ┌──────────▼───────────┐
                  │       Document       │
                  │  (url, type, size)   │
                  └──────┬────┬────┬─────┘
                         │    │    │
            ┌────────────┘    │    └────────────┐
            ▼ *               ▼ *               ▼ 1
     ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
     │ DocumentTag │   │DocReminder  │   │DocAIAnalysis │
     │   (name)    │   │ (dueDate)   │   │  (ocrText)   │
     └─────────────┘   └─────────────┘   └──────────────┘
```

*   **DocumentFolder:** Stores hierarchical directories (`parentId` relation referencing self).
*   **Document:** Represents the uploaded file record (stores `url` pointing to Cloudinary/S3, `fileSize`, file type `pdf`/`image`/`doc`, and reference context).
*   **DocumentTag:** Custom tags for categorization and search filtering.
*   **DocumentReminder:** Set-date expiration alerts (e.g., Lease Renewal Date).
*   **DocumentAIAnalysis:** Stores extracted text via OCR (`ocrText`), classification labels, and summary paragraphs.

---

## 3. Core Operational Flows

### A. Document Upload & OCR Processing Pipeline
1.  **Trigger:** User drags a file into the upload dropzone.
2.  **Frontend POST:** Transmits standard multipart form data via `POST /api/documents/upload` including parent folder ID.
3.  **Backend Controller (`document.controller.js`):**
    *   Multer middleware intercepts the file payload.
    *   Saves file to memory buffer or uploads to Cloudinary storage, returning a secure asset URL.
    *   Creates a `Document` record scoped by active `workspaceId`.
    *   *Asynchronous Task:* Triggers OCR job (handled via BullMQ in production or processed concurrently in development).
4.  **OCR Processing:**
    *   Extracts text content using OCR.
    *   Creates a `DocumentAIAnalysis` model with raw extracted text and summary labels.
    *   Creates an `Alert` model if an expiration date is discovered.

---

## 4. Search and AI Querying System

### Metadata & Index Search
*   Users search documents using tags, file type filters, and date ranges.
*   Queries execute with indexed filters: `where: { workspaceId, deletedAt: null }`.

### Document Chat Interface
*   When a user opens the "AI Chat" tab on a document detail pane:
*   The API fetches the `ocrText` from `DocumentAIAnalysis`.
*   The chat payload sends the conversation log along with the document's OCR content to the LLM backend.
*   The LLM acts as an assistant answering questions restricted exclusively to the document's contents.

---

## 5. Security & Permission Rules

*   **Folder Isolation:** When folders are queried, the system recursively checks that each parent directory belongs to the active `workspaceId`.
*   **Tenant Scoping:** The `documentSecurity.middleware.js` verifies that requested document links match the caller's workspace permissions. If a client attempts to fetch a document not shared with their portal link, the API returns a `403 Forbidden` response.
