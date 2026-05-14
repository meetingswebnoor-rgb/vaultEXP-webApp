/**
 * tenant.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Property Tenants via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

async function assertPropertyOwner(propertyId, userId) {
  const prop = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { userId: true },
  });
  if (!prop || prop.userId !== userId) {
    throw new AppError('Property not found or access denied', 404);
  }
}

class TenantService {
  async create(userId, propertyId, body) {
    await assertPropertyOwner(propertyId, userId);

    if (!body.name)           throw new AppError('Tenant name is required', 422);
    if (!body.rentAmount)     throw new AppError('Rent amount is required', 422);
    if (!body.leaseStartDate) throw new AppError('Lease start date is required', 422);

    const tenant = await prisma.tenant.create({
      data: {
        propertyId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        nationalId: body.nationalId,
        emergencyName: body.emergencyName || body.emergencyContact?.name,
        emergencyPhone: body.emergencyPhone || body.emergencyContact?.phone,
        leaseStartDate: new Date(body.leaseStartDate),
        leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : null,
        rentAmount: parseFloat(body.rentAmount),
        securityDeposit: body.securityDeposit ? parseFloat(body.securityDeposit) : 0,
        paymentDueDay: body.paymentDueDay ? parseInt(body.paymentDueDay, 10) : 1,
        status: body.status || 'active',
        notes: body.notes,
      },
    });


    return tenant;
  }

  async list(userId, propertyId) {
    await assertPropertyOwner(propertyId, userId);
    return await prisma.tenant.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId, tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { property: { select: { name: true, userId: true } } },
    });

    if (!tenant) throw new AppError('Tenant not found', 404);
    if (tenant.property.userId !== userId) throw new AppError('Access denied', 403);

    return tenant;
  }

  async update(userId, tenantId, body) {
    const existing = await this.getById(userId, tenantId); // handles access check

    const updateData = { ...body };
    delete updateData.id;
    delete updateData.propertyId;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.property;

    if (updateData.leaseStartDate) updateData.leaseStartDate = new Date(updateData.leaseStartDate);
    if (updateData.leaseEndDate)   updateData.leaseEndDate = new Date(updateData.leaseEndDate);
    if (updateData.rentAmount)     updateData.rentAmount = parseFloat(updateData.rentAmount);
    if (updateData.securityDeposit)updateData.securityDeposit = parseFloat(updateData.securityDeposit);
    if (updateData.paymentDueDay)  updateData.paymentDueDay = parseInt(updateData.paymentDueDay, 10);

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });


    return updated;
  }

  async delete(userId, tenantId) {
    const tenant = await this.getById(userId, tenantId);

    await prisma.tenant.delete({
      where: { id: tenantId },
    });


    return { deleted: true, name: tenant.name };
  }
}

module.exports = new TenantService();
