# Real-time WebSockets & Synchronization

VaultEXP implements a real-time event pipeline powered by **Socket.io** to drive collaborative chat messaging, instant in-app alerts, concurrent document editing comments, and offline device synchronization.

---

## 1. Websocket Connection Lifecycle

The socket lifecycle is directly tied to the client authentication state to prevent unauthenticated socket connections:

```
    User Login (authStore token is set)
                  │
                  ▼
         [SocketProvider.tsx]
     Instantiates socket.io-client
     Injects JWT Token into auth handshake payload
                  │
                  ▼
         [Backend: Socket Server]
      Verifies JWT Token in handshake
                  │
                  ▼
        Connection Established
  Client automatically joins user & workspace rooms
```

---

## 2. Room Management & Tenant Isolation

To prevent data leaks, socket feeds are strictly segmented into private channels (rooms) mapped to user IDs and workspace IDs:

*   **Workspace Room (`workspace_<workspaceId>`):** Standard room joined by all active members of a workspace. Dispatches modifications to projects, property records, and CRM pipelines.
*   **User Room (`user_<userId>`):** Private room for individual alerts (e.g., invoice payments, personal task assignments).
*   **Chat Room (`chat_channel_<channelId>`):** Temporary room joined by users actively viewing a specific chat room or channel feed.

---

## 3. Realtime Broadcast Actions

Events are fired from backend service triggers to coordinate UI updates:

| Event Identifier | Payload Structure | Triggering Event | Frontend React Query Invalidation |
|---|---|---|---|
| `notification_created` | `{ id, message, link }` | New task assignment, alert | `['notifications']` |
| `chat_message_received`| `{ channelId, sender, content }` | Team chat message submit | `['chat', channelId]` |
| `transaction_posted` | `{ amount, type, walletId }` | Rent paid, invoice marked paid | `['wallets']`, `['transactions']` |
| `sync_draft_pushed` | `{ entityType, payload }` | Offline device sync merge | Matches entity target cache |

---

## 4. Socket Synchronization Flow

If a user edits data offline (e.g., writing notes in a mobile client):
1.  The client queues mutations locally in the Zustand `syncStore`.
2.  Upon reconnecting, the client triggers the sync sync queue.
3.  The frontend pushes draft states via the socket connection.
4.  The server processes draft merges, writes updates to MySQL, and broadcasts the changes to other active devices using the workspace room.
