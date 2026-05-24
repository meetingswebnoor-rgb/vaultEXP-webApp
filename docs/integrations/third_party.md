# Third-Party Integrations Guide

VaultEXP extends its core ledger, file vault, and identity operations by integrating with premium external cloud providers: **Stripe**, **Cloudinary**, and **Google OAuth**.

---

## 1. Stripe Billing & Payments Integration

Stripe is the platform's exclusive payment gateway, configured to process monthly workspace subscriptions and tenant rent deposits.

### Backend Handshake
Stripe operations are handled inside the billing controller (`server/src/modules/billing/`):
*   **Stripe SDK Client:** Initialized using `STRIPE_SECRET_KEY` from environment variables.
*   **Checkout Sessions:** Generates URL checkouts dynamically. Passes workspace IDs in checkout metadata:
    ```javascript
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      metadata: { workspaceId: req.workspaceId }
    });
    ```
*   **Signature Verifications:** The Stripe Webhook endpoint checks the signature header (`stripe-signature`) against `STRIPE_WEBHOOK_SECRET` to prevent request spoofing:
    ```javascript
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    ```

---

## 2. Cloudinary Asset Storage Integration

Document uploads are forwarded directly to **Cloudinary** rather than storing files on local backend disks.

### Upload Workflow
1.  **Frontend Interface:** Dropzones capture files and make standard multi-part payload calls to `/api/documents/upload`.
2.  **Multer Buffer:** The backend `upload.middleware.js` captures the file streams.
3.  **Cloudinary Dispatcher:** The server uploads the file buffer:
    ```javascript
    cloudinary.uploader.upload_stream({ folder: 'vaultexp-docs' }, (err, result) => {
      // result.secure_url contains the public cloud storage link
    });
    ```
4.  **Database Recording:** The returned URL writes to the `Document` schema.

---

## 3. Google OAuth Identity Integration

Google OAuth serves as a passwordless authentication alternative for platform portals:
*   **OAuth Client Flow:** Handled via Google OAuth 2.0. Users log in on the client which requests authorization tokens from Google identity endpoints.
*   **Handshake verification:** The backend exchanges authorization tokens for profiles details (Google ID, name, email).
*   **User Provisioning:** If the email doesn't exist, the backend creates a `User` record automatically with `authProvider: 'google'` and redirects the user to the workspace onboarding process.
*   **Unique Constraints:** The `googleId` column inside the `User` database model ensures single-user mapping.
