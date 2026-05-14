/**
 * business.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Businesses via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class BusinessService {
  /**
   * Create a new business for a user
   */
  async createBusiness(userId, data) {
    const business = await prisma.business.create({
      data: {
        userId,
        name: data.name,
        type: data.type || 'other',
        industry: data.industry,
        description: data.description,
        currency: data.currency || 'USD',
        website: data.website,
        phone: data.phone,
        address: data.address,
        employeeCount: data.employeeCount ? parseInt(data.employeeCount, 10) : null,
        taxId: data.taxId,
        // Founded date needs to be converted to ISO if provided
        foundedDate: data.foundedDate ? new Date(data.foundedDate) : null,
      },
    });

    return business;
  }

  /**
   * Get all businesses for a user
   */
  async getUserBusinesses(userId) {
    return await prisma.business.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { expenses: true, invoices: true, documents: true },
        },
      },
    });
  }

  /**
   * Get detailed view of a single business including its relations
   */
  async getBusinessDetails(userId, businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 50,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!business || business.userId !== userId) {
      throw new AppError('Business not found or access denied', 404, 'BUSINESS_NOT_FOUND');
    }

    // Optional analytics computing could happen here
    // e.g. recalculating totalRevenue / totalExpenses on the fly

    return business;
  }

  /**
   * Update a business
   */
  async updateBusiness(userId, businessId, data) {
    // Verify ownership first
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Business not found or access denied', 404, 'BUSINESS_NOT_FOUND');
    }

    const updateData = { ...data };
    // Prevent updating restricted fields
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.foundedDate) {
      updateData.foundedDate = new Date(updateData.foundedDate);
    }
    if (updateData.employeeCount !== undefined) {
      updateData.employeeCount = updateData.employeeCount ? parseInt(updateData.employeeCount, 10) : null;
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Delete a business completely
   */
  async deleteBusiness(userId, businessId) {
    // Verify ownership first
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Business not found or access denied', 404, 'BUSINESS_NOT_FOUND');
    }

    // Prisma onDelete: Cascade will handle relations (expenses, invoices, documents) automatically
    await prisma.business.delete({
      where: { id: businessId },
    });

    return { success: true };
  }
}

module.exports = new BusinessService();
