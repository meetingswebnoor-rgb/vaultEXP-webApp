/**
 * alert.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Property Alerts via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class AlertService {
  async _assertPropertyOwner(propertyId, userId) {
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });
    if (!prop || prop.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }
  }

  async list(userId, propertyId) {
    await this._assertPropertyOwner(propertyId, userId);
    return await prisma.alert.findMany({
      where: { propertyId, userId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async updateStatus(userId, alertId, status) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });
    if (!alert || alert.userId !== userId) {
      throw new AppError('Alert not found', 404);
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
    });

    return updated;
  }

  async delete(userId, alertId) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });
    if (!alert || alert.userId !== userId) {
      throw new AppError('Alert not found', 404);
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return { deleted: true };
  }

  // ── Auto-Generation Logic ──────────────────────────────────────────────
  async autoGenerate(userId, propertyId) {
    await this._assertPropertyOwner(propertyId, userId);
    
    // Future expansion: we can query Prisma to find expiring leases or overdue rents
    // and generate records in `prisma.alert` accordingly.

    return { generatedCount: 0 };
  }
}

module.exports = new AlertService();
