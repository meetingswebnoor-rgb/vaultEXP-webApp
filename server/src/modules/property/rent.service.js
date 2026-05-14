/**
 * rent.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing RentRecords via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class RentService {
  async _assertPropertyOwner(propertyId, userId) {
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });
    if (!prop || prop.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }
  }

  async getOrCreateMonthlyRecord(userId, propertyId, tenantId, month) {
    await this._assertPropertyOwner(propertyId, userId);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { propertyId: true, rentAmount: true, name: true },
    });
    if (!tenant || tenant.propertyId !== propertyId) {
      throw new AppError('Tenant not found on this property', 404);
    }

    let record = await prisma.rentRecord.findUnique({
      where: {
        tenantId_month: { tenantId, month },
      },
    });

    if (!record) {
      record = await prisma.rentRecord.create({
        data: {
          propertyId,
          tenantId,
          userId,
          month,
          amountExpected: tenant.rentAmount,
          amountPaid: 0,
          status: 'pending',
        },
      });

    }

    return record;
  }

  async list(userId, propertyId, query = {}) {
    await this._assertPropertyOwner(propertyId, userId);

    const where = { propertyId, userId };
    if (query.month) where.month = query.month;
    if (query.tenantId) where.tenantId = query.tenantId;

    return await prisma.rentRecord.findMany({
      where,
      orderBy: { month: 'desc' },
      include: {
        tenant: { select: { name: true } },
      },
    });
  }

  async update(userId, recordId, body) {
    const record = await prisma.rentRecord.findUnique({
      where: { id: recordId },
    });
    if (!record || record.userId !== userId) {
      throw new AppError('Rent record not found', 404);
    }

    const updates = { ...body };
    delete updates.id;
    delete updates.propertyId;
    delete updates.tenantId;
    delete updates.userId;
    delete updates.month;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Recalculate status from amounts if amountPaid is updated
    let newStatus = record.status;
    if (updates.amountPaid !== undefined) {
      updates.amountPaid = parseFloat(updates.amountPaid);
      const amountExpected = parseFloat(record.amountExpected);
      
      if (updates.amountPaid >= amountExpected) {
        newStatus = 'paid';
      } else if (updates.amountPaid > 0) {
        newStatus = 'partial';
      } else {
        newStatus = 'pending';
      }
      updates.status = newStatus;
    }
    
    if (updates.paymentDate) updates.paymentDate = new Date(updates.paymentDate);
    if (updates.lateFee) updates.lateFee = parseFloat(updates.lateFee);

    const updated = await prisma.rentRecord.update({
      where: { id: recordId },
      data: updates,
    });


    return updated;
  }

  async generateBulkForMonth(userId, propertyId, month) {
    await this._assertPropertyOwner(propertyId, userId);

    const activeTenants = await prisma.tenant.findMany({
      where: { propertyId, status: 'active' },
      select: { id: true, rentAmount: true },
    });

    if (activeTenants.length === 0) return [];

    const existingRecords = await prisma.rentRecord.findMany({
      where: {
        propertyId,
        month,
        tenantId: { in: activeTenants.map(t => t.id) }
      },
      select: { tenantId: true }
    });
    const existingTenantIds = new Set(existingRecords.map(r => r.tenantId));

    const recordsToCreate = activeTenants
      .filter(t => !existingTenantIds.has(t.id))
      .map(t => ({
        propertyId,
        tenantId: t.id,
        userId,
        month,
        amountExpected: t.rentAmount,
        amountPaid: 0,
        status: 'pending',
      }));

    if (recordsToCreate.length > 0) {
      await prisma.rentRecord.createMany({
        data: recordsToCreate,
        skipDuplicates: true,
      });
    }


    return await this.list(userId, propertyId, { month });
  }
}

module.exports = new RentService();
