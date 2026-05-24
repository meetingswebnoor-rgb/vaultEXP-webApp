# Security, Auditing & Compliance Policies

VaultEXP implements financial-grade security layers to protect tenant data, prevent cross-origin injection, and maintain a secure workspace audit trail.

---

## 1. Request Security & Shielding Middleware

### CORS Policies
CORS rules inside [app.js](file:///C:/Users/meeti/Downloads/VaultWebApp/server/src/app.js) block unauthorized cross-domain actions. Requests originating from browser applications must match a production whitelist. Non-browser API callers (e.g. mobile client agents, curl utilities) bypass origin validation but must present valid JWT tokens.

### Request Size Limits (`limits.middleware.js`)
To protect server resources from Denial of Service (DoS) attacks:
*   Incoming JSON body limits are capped: `limit: '10mb'`.
*   Form-urlencoded parameters are bounded to `10mb`.

### Rate Limiting & Intrusion Detection (`security.middleware.js`)
*   Protects authentication endpoints from brute-force attempts.
*   Restricts API query rates to a maximum of 100 requests per 15-minute window per IP.
*   Automatically locks accounts temporarily after 5 failed login attempts within a 15-minute window (`lockedUntil` column in the `User` model).

---

## 2. Cryptographic Storage & Session Controls

*   **Password Hashing:** Passwords are hashed before database write using the `bcryptjs` library with a work factor of 10 rounds.
*   **JWT Storage Protection:** Frontend tokens are obscured inside the browser's local storage using a custom XOR cipher and Base64 wrapping (`secureStorage.ts`) to prevent simple inspector extractions.

---

## 3. Resource & Document Isolation

To prevent users from reading private files via direct URL guessing:

### Document Protection (`documentSecurity.middleware.js`)
1.  When a file request is made, the controller passes details through the document security middleware.
2.  The middleware queries the database:
    ```javascript
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    ```
3.  Checks workspace ownership: `doc.workspaceId === req.workspaceId`.
4.  If the file belongs to a shared vault, it verifies the caller is a member:
    ```javascript
    const member = await prisma.vaultMember.findFirst({
      where: { vaultId: doc.vaultId, userId: req.user.id }
    });
    ```
5.  If validation fails, the middleware blocks file delivery, returning a `403 Forbidden` response.

---

## 4. Compliance Audits & Logging (`SecurityLog`)

Sensitive events write persistent audit records to the `SecurityLog` table:
*   **Actions Logged:** `LOGIN`, `LOGIN_FAILED`, `FILE_DOWNLOAD`, `PERMISSION_CHANGE`, `SUSPICIOUS_ACTIVITY`.
*   **Fields Captured:** IP Address, User Agent, severity level (`INFO`, `WARNING`, `CRITICAL`), and operation description.
*   **Severity Escalation:** Suspicious requests or repeated unauthorized route hits escalate severity states to `CRITICAL`, triggering alert entries on the Admin Dashboard.
