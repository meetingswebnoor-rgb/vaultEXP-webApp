# Developer Cookbook: Code Patterns & Extensibility

This document provides boilerplate templates and procedural checklists for extending VaultEXP's database models, REST APIs, and Next.js frontend pages.

---

## 1. Extending Database Models (Prisma)

### Scenario: Adding a "MaintenanceTicket" asset repair log

### Step A: Update the Schema
Add the new model at the bottom of [schema.prisma](file:///C:/Users/meeti/Downloads/VaultWebApp/server/prisma/schema.prisma):
```prisma
model MaintenanceTicket {
  id          String   @id @default(cuid())
  workspaceId String   @map("workspace_id")
  propertyId  String   @map("property_id")
  title       String   @db.VarChar(200)
  description String   @db.Text
  status      String   @default("pending") @db.VarChar(20) // pending, completed
  createdAt   DateTime @default(now()) @map("created_at")

  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  @@index([workspaceId])
  @@map("maintenance_tickets")
}
```
*Note: Also add the relation array back inside the parent `Property` model: `tickets MaintenanceTicket[]`.*

### Step B: Generate & Push Changes
```bash
cd server
# Generate updated Prisma Client TypeScript types
npx prisma generate
# Push modifications to local MySQL database
npx prisma db push
```

---

## 2. Creating a Backend API Route

### Step A: Create the Route file (`ticket.routes.js`)
Create the file at `server/src/modules/ticket/ticket.routes.js`:
```javascript
const express = require('express');
const router = express.Router();
const controller = require('./ticket.controller');
const protect = require('../../middleware/auth.middleware');

router.post('/', protect, controller.createTicket);
module.exports = router;
```

### Step B: Create the Controller file (`ticket.controller.js`)
Create the file at `server/src/modules/ticket/ticket.controller.js`:
```javascript
const service = require('./ticket.service');

exports.createTicket = async (req, res, next) => {
  try {
    const ticket = await service.create(req.body, req.user.id, req.workspaceId);
    return res.status(201).json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};
```

### Step C: Create the Service file (`ticket.service.js`)
Create the file at `server/src/modules/ticket/ticket.service.js`:
```javascript
const prisma = require('../../lib/prisma');

exports.create = async (data, userId, workspaceId) => {
  return prisma.maintenanceTicket.create({
    data: {
      title: data.title,
      description: data.description,
      propertyId: data.propertyId,
      workspaceId: workspaceId
    }
  });
};
```

### Step D: Register the module in `app.js`
Open [app.js](file:///C:/Users/meeti/Downloads/VaultWebApp/server/src/app.js) and register the path inside the wrapped safe load mounting section:
```javascript
app.use('/api/tickets', safeLoad('./modules/ticket/ticket.routes'));
```

---

## 3. Creating a Frontend Page (Next.js)

### Step A: Define the Page Entry
Create a new directory and page at `client/app/(dashboard)/tickets/page.tsx`:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function TicketsPage() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get('/api/tickets').then(res => res.data.tickets),
    enabled: isAuthenticated // Prevents firing during auth loading loops
  });

  if (isLoading) return <div>Loading tickets...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Maintenance Tickets</h1>
      <ul>
        {data?.map((ticket: any) => (
          <li key={ticket.id} className="p-3 border-b">{ticket.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step B: Add to Sidebar Navigation
Open [navigation.ts](file:///C:/Users/meeti/Downloads/VaultWebApp/client/config/navigation.ts) and add the page to the `MAIN_NAV` array:
```typescript
{ label: 'Tickets', href: '/tickets', icon: Hammer }
```
