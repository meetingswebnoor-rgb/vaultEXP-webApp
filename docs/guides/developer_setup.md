# Developer Setup & Installation Guide

This guide details the commands, environment configurations, and tools required to set up and run a local development environment for VaultEXP.

---

## 1. Prerequisites

Before setting up the repository, ensure your development system has the following installed:
*   **Node.js:** version 18.x or 20.x (LTS recommended)
*   **Docker Desktop:** (Recommended for running MySQL and Redis dependencies locally)
*   **Git:** for repository operations

---

## 2. Step-by-Step Installation

### Step A: Clone the Codebase
```bash
git clone https://github.com/your-org/VaultWebApp.git
cd VaultWebApp
```

### Step B: Setup Local Configuration Files

1.  **Frontend Config:** Create a `.env` file in the `/client` directory:
    ```ini
    # client/.env
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

2.  **Backend Config:** Create a `.env` file in the `/server` directory:
    ```ini
    # server/.env
    PORT=5000
    NODE_ENV=development
    DATABASE_URL=mysql://root:password@localhost:3306/vaultexp
    JWT_SECRET=development_fallback_secret_key_112233
    JWT_EXPIRES_IN=7d
    CORS_ORIGIN=http://localhost:3000,http://localhost:3001
    # Redis is optional in development. If absent, workers run in-process
    REDIS_URL=redis://localhost:6379
    ```

---

## 3. Database Initial Setup

If running MySQL locally (or through the included `docker-compose.yml` file):
1.  **Launch Dependencies:**
    ```bash
    docker-compose up -d
    ```
2.  **Run Migrations & Seed:**
    ```bash
    cd server
    # Generate Prisma Client classes
    npx prisma generate
    # Push database structure
    npx prisma db push
    # Seed database users
    node seed.js
    ```

---

## 4. Running the Applications

### Start the Express Backend Server
```bash
cd server
npm run dev
# Server boots on http://localhost:5000
```

### Start the Next.js Frontend App
```bash
cd client
npm run dev
# Application starts on http://localhost:3000
```

---

## 5. Development Command Reference

| Action | Workspace Path | Command |
|---|---|---|
| Launch Database GUI Viewer | `server` | `npx prisma studio` |
| Re-generate Database Types | `server` | `npx prisma generate` |
| Reset Database Tables | `server` | `npx prisma migrate reset` |
| Type Check Frontend Code | `client` | `npx tsc --noEmit` |
| Clear Next.js Webpack cache | `client` | `rm -rf .next` (PowerShell: `Remove-Item -Recurse -Force .next`) |
| Build Production Client Package | `client` | `npm run build` |
