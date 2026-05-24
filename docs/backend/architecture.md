# Backend Architecture (Express & Node.js)

The backend is built inside the `/server` directory using **Node.js** and the **Express.js** web framework. This document explains the routing structures, middleware pipelines, safe module loading, controllers/services partitioning, and ORM integrations.

---

## 1. Application Bootstrap & Routing Design

The entry point of the server is `server.js`, which imports the Express application configured in `src/app.js` and listens on the designated environment port.

```
   server.js (Starts HTTP Server & Sockets)
       │
       ▼
     app.js (Express Middleware Pipeline Configuration)
       │
       ├─► /api/auth    (Directly required auth routes)
       │
       └─► /api/client, /api/property, /api/wallet...
           (Dynamic mount via safeLoad wrapper)
```

---

## 2. Middleware Execution Chain

To protect backend controllers from crashes, incorrect access, and malformed inputs, incoming HTTP requests run through a strict middleware chain configured inside `app.js`:

1.  **CORS & Options Preflight:** Handled first using the `cors` package. Matches headers to allowed origins, enabling cross-domain Axios requests from Vercel frontends.
2.  **Body Parsing:** Parses JSON and URL-encoded bodies up to `10mb` limits.
3.  **Security Headers:** Helmet enforces security headers (disabling inline scripts constraints where appropriate).
4.  **Health Check Route:** Mounted at `/health` to quickly confirm MySQL connection and server status.
5.  **API Routes:** Scopes routing paths under `/api/*`.
6.  **Global Error Handler:** Catches all unhandled exceptions, returning standard error payloads instead of exposing stack traces.

---

## 3. Dynamic Module Shielding (`safeLoad`)

VaultEXP uses a custom **Safe Module Loader** to mount optional submodules. If a submodule is broken (e.g. invalid syntax, missing dependency), the server bypasses the crash, mounts a fallback stub, and continues running:

```javascript
function safeLoad(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    console.error('[APP] ❌ Failed to load:', modulePath);
    const stub = express.Router();
    stub.all('*', (_req, res) =>
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        module: modulePath,
      })
    );
    return stub;
  }
}
```

---

## 4. Separation of Concerns (Controller & Service Layers)

All business modules (inside `/server/src/modules/`) follow a strict **Controller-Service pattern**:

*   **Routes File (`*.routes.js`):** Declares endpoint URLs, validation rules, and permission checks:
    ```javascript
    router.post('/', protect, tenantFilter, validateBody, createController);
    ```
*   **Controller File (`*.controller.js`):** Intercepts standard Express `req` and `res` objects. Resolves path parameters and delegates business calculations to the service layer:
    ```javascript
    const result = await service.createItem(req.body, req.workspaceId);
    return res.status(201).json(result);
    ```
*   **Service File (`*.service.js`):** Contains pure business logic. Communicates directly with the database using the Prisma Client singleton `src/lib/prisma.js`:
    ```javascript
    async createItem(data, workspaceId) {
      return prisma.item.create({ data: { ...data, workspaceId } });
    }
    ```
