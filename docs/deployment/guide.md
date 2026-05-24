# Production Deployment & Troubleshooting Guide

This document details the configuration parameters, environment variables, deployment pipelines, and troubleshooting solutions for hosting the VaultEXP platform.

---

## 1. Hosting Configurations

VaultEXP is configured to split client and server code into isolated hosts for performance and security:
*   **Frontend (Next.js):** Deployed to **Vercel**.
*   **Backend (Express):** Deployed to **Railway** (linked to a MySQL Database instance).

---

## 2. Environment Variables Specification

### Frontend Configuration (`client/.env.production`)
Must be configured prior to triggering Next.js static builds:
```ini
# Production domain of your frontend
NEXT_PUBLIC_APP_URL=https://vaultexp-client.vercel.app

# Production domain of your backend API gateway
NEXT_PUBLIC_API_URL=https://vaultexp-backend.railway.app
```

### Backend Configuration (`server/.env`)
Must be populated inside the Railway Dashboard settings panel:
```ini
PORT=5000
NODE_ENV=production

# Database Connection String
DATABASE_URL=mysql://root:password@railway-db-host:3306/vaultexp

# JWT Session Properties
JWT_SECRET=production_strong_secret_key_change_me
JWT_EXPIRES_IN=7d

# CORS Allowed Domains (Comma-separated)
CORS_ORIGIN=https://vaultexp-client.vercel.app

# Optional Queue Engine Configurations
REDIS_URL=redis://default:password@railway-redis-host:6379

# Third-Party API Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

## 3. Production Deployment Workflows

### Database Migration Step
Before building the backend on Railway, execute the migrations to build database tables:
```bash
# Apply schema changes to production database
cd server && npx prisma migrate deploy
```

### Backend Build Flow
Railway reads the project file structure and executes the bootstrap script:
```bash
# Install server packages
npm install
# Generate database type clients
npx prisma generate
# Start application
npm start
```

### Frontend Build Flow
Configure Vercel to point to `/client` as the root directory:
*   **Build Command:** `npm run build`
*   **Output Directory:** `.next`
*   **Install Command:** `npm install`

---

## 4. Common Troubleshooting Solutions

### CORS Blocking Errors
*   **Issue:** Browser console logs: `CORS not allowed for origin: ...`
*   **Reason:** The incoming request domain is missing from the server's `allowedOrigins` array in `app.js`.
*   **Solution:** Edit the custom origins list inside [app.js](file:///C:/Users/meeti/Downloads/VaultWebApp/server/src/app.js) to include the new domain.

### Broken Prisma Client Builds
*   **Issue:** Server fails startup with `Cannot find module '@prisma/client'`.
*   **Reason:** The runtime code imports Prisma, but type definitions haven't regenerated post-dependencies install.
*   **Solution:** Ensure the deployment script runs `prisma generate` before startup.

### Infinite Loading Stuck Screen
*   **Issue:** Users hit `/dashboard` and get stuck on the premium loading spinner.
*   **Reason:** Hydration logic has thrown an exception in `localStorage` parsing, or the backend is failing database queries.
*   **Solution:** Clear local storage and inspect the browser network console for database health outputs (`/api/health`).
