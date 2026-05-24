# Backend API Architecture & Endpoints Reference

All frontend network calls query the Express.js API gateway mounted under `/api/*`. This document provides the request formats, headers, payload requirements, authorization layers, and success responses for every core controller.

---

## 1. Global Request Specifications

### Required Headers
For all endpoints guarded by authentication (Authorization status: `JWT`):
```http
Authorization: Bearer <jsonwebtoken_access_token>
x-workspace-id: <active_workspace_cuid>
```

### Standard Error Response Body
```json
{
  "success": false,
  "message": "Error description string",
  "code": "ERROR_CODE_STRING",
  "statusCode": 400
}
```

---

## 2. Authentication System Endpoints

### Signup User
*   **Endpoint:** `POST /api/auth/signup`
*   **Authentication Required:** None (Public)
*   **Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "cm0123abc456def789",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER"
      }
    }
    ```

### Login User
*   **Endpoint:** `POST /api/auth/login`
*   **Authentication Required:** None (Public)
*   **Request Body:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "cm0123abc456def789",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER"
      }
    }
    ```

### Get Session Identity
*   **Endpoint:** `GET /api/auth/me`
*   **Authentication Required:** JWT Access Token
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "user": {
        "id": "cm0123abc456def789",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER"
      }
    }
    ```

---

## 3. Workspaces Management Endpoints

### List Active User Workspaces
*   **Endpoint:** `GET /api/workspaces`
*   **Authentication Required:** JWT
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "workspaces": [
        {
          "id": "wsp_cm987xyz",
          "name": "Acme Ventures LLC",
          "role": "owner",
          "createdAt": "2026-05-01T12:00:00Z"
        }
      ]
    }
    ```

### Create Workspace
*   **Endpoint:** `POST /api/workspaces`
*   **Authentication Required:** JWT
*   **Request Body:**
    ```json
    {
      "name": "Apex Holdings"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "workspace": {
        "id": "wsp_cm999xyz",
        "name": "Apex Holdings",
        "createdAt": "2026-05-23T10:00:00Z"
      }
    }
    ```

---

## 4. Financial OS Endpoints

### List Wallets
*   **Endpoint:** `GET /api/wallet`
*   **Authentication Required:** JWT + Workspace Scope
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "wallets": [
        {
          "id": "wlt_111222333",
          "name": "Chase Operating",
          "type": "checking",
          "balance": 248500.00,
          "currency": "USD"
        }
      ]
    }
    ```

### Create Transaction
*   **Endpoint:** `POST /api/wallet/:id/transaction`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Body:**
    ```json
    {
      "amount": 1250.00,
      "type": "expense",
      "category": "utilities",
      "description": "Monthly office electricity payment",
      "status": "completed"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "transaction": {
        "id": "tx_abc789",
        "amount": 1250.00,
        "type": "expense",
        "balanceSnapshot": 247250.00,
        "createdAt": "2026-05-23T10:00:00Z"
      }
    }
    ```

---

## 5. Property & Rent Endpoints

### Create Property Portfolio Item
*   **Endpoint:** `POST /api/property`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Body:**
    ```json
    {
      "name": "Broadmoor Plaza Suite A",
      "address": "1200 Broadmoor Way",
      "type": "commercial",
      "value": 1500000.00
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "property": {
        "id": "prop_999888",
        "name": "Broadmoor Plaza Suite A",
        "status": "vacant",
        "createdAt": "2026-05-23T10:00:00Z"
      }
    }
    ```

### Record Rental Payment
*   **Endpoint:** `POST /api/property/rent-records/:id/pay`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Body:**
    ```json
    {
      "walletId": "wlt_111222333",
      "paymentMethod": "ACH"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Rent payment recorded successfully",
      "rentRecord": {
        "id": "rent_rec_555",
        "status": "paid",
        "paidAt": "2026-05-23T10:05:00Z"
      }
    }
    ```

---

## 6. Document Vault Endpoints

### Upload Document
*   **Endpoint:** `POST /api/documents/upload`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Format:** `multipart/form-data`
*   **Parameters:**
    *   `file`: Binary File payload
    *   `folderId` (Optional): String UUID of Parent Folder
    *   `context` (Optional): String context (`business`, `property`, `vault`)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "document": {
        "id": "doc_888999",
        "name": "Q1_Tax_Returns.pdf",
        "url": "https://cloudinary.com/vaultexp/Q1_Tax_Returns.pdf",
        "fileSize": 1250000,
        "type": "pdf"
      }
    }
    ```

---

## 7. CRM Pipelines Endpoints

### Update Deal Stage
*   **Endpoint:** `PUT /api/crm/deals/:id/stage`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Body:**
    ```json
    {
      "stageId": "stg_999000"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "deal": {
        "id": "deal_12345",
        "title": "Broadmoor Office Lease Deal",
        "stageId": "stg_999000",
        "updatedAt": "2026-05-23T10:10:00Z"
      }
    }
    ```

---

## 8. AI Chat & OCR Completion

### Chat with Workspace Context
*   **Endpoint:** `POST /api/ai/chat`
*   **Authentication Required:** JWT + Workspace Scope
*   **Request Body:**
    ```json
    {
      "message": "What is our total cash balance across wallets?",
      "conversationHistory": []
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "response": "Based on Chase Operating and Crypto Reserve wallets, the total combined balance across your workspace is $482,500.00.",
      "tokensUsed": 184
    }
    ```
