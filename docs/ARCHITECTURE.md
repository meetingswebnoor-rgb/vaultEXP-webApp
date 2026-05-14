# VaultEXP — Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Pages   │  │Components│  │ Features │  │   Hooks   │  │
│  │(App Dir) │  │(Reusable)│  │(Modules) │  │(Shared)   │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └───────────┘  │
│       │                           │                         │
│       │         lib/api/client.ts (Axios + Interceptors)    │
│       └───────────────────────────┘                         │
└─────────────────────────┬───────────────────────────────────┘
                           │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                    SERVER (Express)                          │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Routes  │→ │  Controllers │→ │       Services        │  │
│  └─────────┘  └──────────────┘  └───────────┬───────────┘  │
│                                              │              │
│  ┌─────────────────────┐   ┌────────────────▼────────────┐ │
│  │     Middleware       │   │         Models (Mongoose)   │ │
│  │ auth / validate /    │   │  User / Vault / ...         │ │
│  │ error / rate-limit   │   └────────────────┬────────────┘ │
│  └─────────────────────┘                     │             │
└─────────────────────────────────────────────┼─────────────┘
                                              │
                    ┌─────────────────────────▼──────┐
                    │        MongoDB + Redis           │
                    └────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SHARED PACKAGE                            │
│  TypeScript Types │ Zod Validators │ Constants │ Utils       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow — Login

```
User → LoginPage
  → useLogin() hook (React Query mutation)
    → authApi.login() (Axios POST /auth/login)
      → Server: AuthController.login()
        → AuthService.login()
          → User.findOne() + bcrypt.compare()
          → generateTokens()
        → Response: { user, tokens }
      → localStorage: accessToken + refreshToken
      → router.push('/dashboard')
```

## Module Pattern (Server)

Each module follows:
```
modules/
└── auth/
    ├── auth.routes.js      → Express router
    ├── auth.controller.js  → HTTP layer (req/res)
    ├── auth.service.js     → Business logic
    └── auth.validator.js   → Zod schema
```

## Security Layers

| Layer | Mechanism |
|-------|-----------|
| Auth | JWT access + refresh tokens |
| RBAC | Role-based middleware (admin/manager/member/viewer) |
| Rate Limiting | express-rate-limit (global + per-route) |
| Input Validation | Zod schemas (shared client/server) |
| Security Headers | Helmet |
| CORS | Whitelisted origins |
| Password | bcrypt (12 rounds) |
