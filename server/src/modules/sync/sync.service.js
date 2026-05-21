const prisma = require('../../lib/prisma');

class SyncService {
  /**
   * Pulls all records updated since lastSyncTimestamp.
   * This allows the mobile app to sync its offline SQLite/WatermelonDB quickly.
   */
  async pullSync(userId, lastSyncTimestamp) {
    const since = lastSyncTimestamp ? new Date(parseInt(lastSyncTimestamp, 10)) : new Date(0);

    const [
      user, businesses, properties, wallets, transactions, documents,
      tasks, crmNotes, expenses, alerts
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.business.findMany({ where: { userId, updatedAt: { gte: since } } }),
      prisma.property.findMany({ where: { userId, updatedAt: { gte: since } } }),
      prisma.wallet.findMany({ where: { userId, updatedAt: { gte: since } } }),
      prisma.transaction.findMany({ where: { userId, updatedAt: { gte: since } } }),
      prisma.document.findMany({ where: { userId, updatedAt: { gte: since } } }),
      prisma.task.findMany({ where: { assigneeId: userId, updatedAt: { gte: since } } }), // Assignee
      prisma.cRMNote.findMany({ where: { authorId: userId, updatedAt: { gte: since } } }),
      prisma.expense.findMany({ where: { 
        category: { userId }, // user owns the category
        updatedAt: { gte: since } 
      }}),
      prisma.alert.findMany({ where: { userId, updatedAt: { gte: since } } })
    ]);

    return {
      timestamp: Date.now(),
      changes: {
        users: { created: [], updated: user && user.updatedAt >= since ? [user] : [], deleted: [] },
        businesses: { created: [], updated: businesses, deleted: [] },
        properties: { created: [], updated: properties, deleted: [] },
        wallets: { created: [], updated: wallets, deleted: [] },
        transactions: { created: [], updated: transactions, deleted: [] },
        documents: { created: [], updated: documents, deleted: [] },
        tasks: { created: [], updated: tasks, deleted: [] },
        crmNotes: { created: [], updated: crmNotes, deleted: [] },
        expenses: { created: [], updated: expenses, deleted: [] },
        alerts: { created: [], updated: alerts, deleted: [] }
      }
    };
  }

  /**
   * Pushes a queue of offline mutations back to the server safely.
   */
  async pushSync(userId, changes) {
    const results = { successful: [], conflicts: [], failed: [] };

    // Generic processor for a specific model
    const processTable = async (modelName, created, updated, deleted) => {
      const model = prisma[modelName];
      if (!model) return;

      // 1. Process Creates (Prevent Duplicates via Upsert)
      for (const record of created) {
        try {
          const { id, ...data } = record;
          await model.upsert({
            where: { id: id || undefined },
            update: { ...data }, // if it already exists, update it instead
            create: { id, ...data }
          });
          results.successful.push({ id, modelName, action: 'CREATE' });
        } catch (err) {
          results.failed.push({ id: record.id, modelName, action: 'CREATE', error: err.message });
        }
      }

      // 2. Process Updates (Conflict Resolution)
      for (const record of updated) {
        try {
          const { id, updatedAt, ...data } = record;
          
          // Fetch current server version
          const serverRecord = await model.findUnique({ where: { id } });
          
          if (!serverRecord) {
            results.failed.push({ id, modelName, action: 'UPDATE', error: 'Record not found' });
            continue;
          }

          // Conflict Check (Server Wins)
          if (new Date(serverRecord.updatedAt).getTime() > new Date(updatedAt).getTime()) {
            results.conflicts.push({
              id,
              modelName,
              action: 'UPDATE',
              serverTruth: serverRecord,
              clientAttempt: record
            });
            continue;
          }

          await model.update({
            where: { id },
            data: { ...data }
          });
          results.successful.push({ id, modelName, action: 'UPDATE' });
        } catch (err) {
          results.failed.push({ id: record.id, modelName, action: 'UPDATE', error: err.message });
        }
      }

      // 3. Process Deletes
      for (const id of deleted) {
        try {
          await model.delete({ where: { id } });
          results.successful.push({ id, modelName, action: 'DELETE' });
        } catch (err) {
          // If already deleted, it's fine
          if (err.code === 'P2025') {
            results.successful.push({ id, modelName, action: 'DELETE' });
          } else {
            results.failed.push({ id, modelName, action: 'DELETE', error: err.message });
          }
        }
      }
    };

    // Process all tables concurrently or sequentially
    const tableMappings = {
      'businesses': 'business',
      'properties': 'property',
      'wallets': 'wallet',
      'transactions': 'transaction',
      'documents': 'document',
      'tasks': 'task',
      'crmNotes': 'cRMNote',
      'expenses': 'expense',
      'alerts': 'alert'
    };

    for (const [table, modelName] of Object.entries(tableMappings)) {
      if (changes[table]) {
        await processTable(modelName, changes[table].created || [], changes[table].updated || [], changes[table].deleted || []);
      }
    }

    return {
      success: true,
      timestamp: Date.now(),
      results
    };
  }
}

module.exports = new SyncService();
