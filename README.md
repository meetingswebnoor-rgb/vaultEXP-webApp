<<<<<<< HEAD
# VaultEXP — Financial Ecosystem OS

> Premium AI-powered SaaS platform for business assets, finance, and property management. Rebuilt for performance, scalability, and modern financial-grade standards.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql)](https://mysql.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-black?logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## 📦 Modern Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| **Frontend**  | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| **Backend**   | Node.js + Express (Clean Module Architecture)           |
| **ORM**       | Prisma 6 (Type-safe Database Access)                    |
| **Database**  | MySQL 8 (Relational Integrity)                          |
| **Cache**     | Redis (Analytics & Performance)                         |
| **Auth**      | Stateless JWT + Persistent Auth Store (Zustand)         |
| **Validation**| Zod (End-to-end schema validation)                      |
| **State**     | Zustand + React Query (TanStack)                        |

---

## 🗂 Project Structure

```
vaultexp/
├── client/            → Next.js 14 frontend (App Router)
├── server/            → Node.js + Express API (Module-based)
│   ├── prisma/        → Schema & Migrations
│   └── src/modules/   → Business, Property, Wallet, Investment modules
├── shared/            → Shared TypeScript types & validation (Legacy)
├── .env               → Environment variables
├── docker-compose.yml → Full stack Docker setup (MySQL + Redis + App)
└── package.json       → NPM workspaces root
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18
- **MySQL** 8.0+
- **Redis** (optional for local dev)

### 1. Setup Environment

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/vaultexp.git
cd vaultexp
npm install
```

### 2. Configure Database

1. Create a `.env` file in the `server/` directory (or use the root `.env`).
2. Update `DATABASE_URL` with your MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/vaultexp"
```

### 3. Initialize Prisma

Run migrations and generate the client:

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Development Servers

```bash
# From the root directory
npm run dev          # runs both client + server concurrently
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## 🔐 Core Modules

| Module      | Key Features                                           |
|-------------|--------------------------------------------------------|
| **Business**| Entity management, analytics, financial tracking        |
| **Property**| Rent management, Tenant tracking, Expenses, Documents  |
| **Wallet**  | Bank account linking, Transaction ledger, Multi-currency|
| **Investment**| Portfolio tracking, ROI engine, Asset distribution     |
| **Auth**    | Secure signup/login, Protected routing, Profile mgmt   |

---

## 📄 License

MIT © VaultEXP Team
=======
# vaultEXP-webApp
Under Developments 
>>>>>>> bac8455d8d0bb20539641b1a4e24ba8e9be1871b
