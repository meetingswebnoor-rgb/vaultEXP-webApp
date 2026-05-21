/**
 * property.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Properties via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const eventBus = require('../../lib/eventBus');

class PropertyService {

  // ── CREATE ────────────────────────────────────────────────────
  async create(userId, body) {
    if (!body.name)    throw new AppError('Property name is required', 422);
    if (!body.address) throw new AppError('Property address is required', 422);

    const property = await prisma.property.create({
      data: {
        userId,
        name: body.name,
        type: body.type || 'residential',
        status: body.status || 'owned',
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        description: body.description,
        sizeSqft: body.sizeSqft ? parseFloat(body.sizeSqft) : null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms, 10) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms, 10) : null,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt, 10) : null,
        currency: body.currency || 'USD',
        purchaseValue: body.purchaseValue ? parseFloat(body.purchaseValue) : null,
        currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
        amenities: body.amenities || null,
        mortgageData: body.mortgage || body.mortgageData || null,
      },
    });

    eventBus.emit('property.added', { propertyId: property.id, userId, name: property.name });

    return property;
  }

  // ── LIST ──────────────────────────────────────────────────────
  async list(userId, query = {}) {
    const { status, type, page = 1, limit = 20 } = query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { tenants: { where: { status: 'active' } } } }
        }
      }),
      prisma.property.count({ where }),
    ]);

    // Format for frontend
    const formattedProperties = properties.map(p => ({
      ...p,
      tenantCount: p._count.tenants
    }));

    return {
      properties: formattedProperties,
      total,
      page:  parseInt(page, 10),
      limit: take,
      pages: Math.ceil(total / take),
    };
  }

  // ── GET BY ID ─────────────────────────────────────────────────
  async getById(userId, propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        tenants: {
          orderBy: { leaseStartDate: 'desc' },
          take: 100,
        },
        expenses: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        alerts: {
          where: { status: { in: ['pending', 'seen'] } },
          orderBy: { priority: 'desc' },
          take: 20,
        },
      },
    });

    if (!property || property.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }

    const totalExpenses = property.expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const monthlyRentIncome = property.tenants
      .filter(t => t.status === 'active')
      .reduce((s, t) => s + parseFloat(t.rentAmount || 0), 0);

    return {
      ...property,
      summary: {
        tenantCount:     property.tenants.length,
        activeTenants:   property.tenants.filter(t => t.status === 'active').length,
        totalExpenses,
        monthlyRentIncome,
        pendingAlerts:   property.alerts.filter(a => a.status === 'pending').length,
      },
    };
  }

  // ── UPDATE ────────────────────────────────────────────────────
  async update(userId, propertyId, body) {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }

    const updateData = { ...body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Cast numbers
    if (updateData.sizeSqft) updateData.sizeSqft = parseFloat(updateData.sizeSqft);
    if (updateData.bedrooms) updateData.bedrooms = parseInt(updateData.bedrooms, 10);
    if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms, 10);
    if (updateData.yearBuilt) updateData.yearBuilt = parseInt(updateData.yearBuilt, 10);
    if (updateData.purchaseValue) updateData.purchaseValue = parseFloat(updateData.purchaseValue);
    if (updateData.currentValue) updateData.currentValue = parseFloat(updateData.currentValue);

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
    });

    return property;
  }

  // ── DELETE ────────────────────────────────────────────────────
  async delete(userId, propertyId) {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true, name: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return { deleted: true, name: existing.name };
  }

  // ── STATS ─────────────────────────────────────────────────────
  async getStats(userId) {
    const [stats, activeTenants] = await Promise.all([
      prisma.property.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { currentValue: true, purchaseValue: true }
      }),
      prisma.tenant.count({
        where: { property: { userId }, status: 'active' }
      })
    ]);

    const totalCurrent = parseFloat(stats._sum.currentValue || 0);
    const totalPurchase = parseFloat(stats._sum.purchaseValue || 0);

    return {
      propertyCount:   stats._count.id,
      portfolioValue:  totalCurrent,
      totalInvestment: totalPurchase,
      appreciation:    totalCurrent - totalPurchase,
      activeTenants:   activeTenants,
    };
  }

  // ── ANALYTICS ────────────────────────────────────────────────
  async getAnalytics(userId, propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true, name: true }
    });

    if (!property || property.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }

    // A real implementation would group by month
    return {
      propertyId,
      propertyName: property.name,
      metrics: { totalRent: 0, totalExpenses: 0, netProfit: 0 },
      chartData: [],
    };
  }

  // ── AI CONTEXT ────────────────────────────────────────────────
  async getPropertyContext(userId, propertyId) {
    // We already have a rich getter, use that
    const data = await this.getById(userId, propertyId);
    
    return {
      property: {
        name: data.name,
        type: data.type,
        address: data.address,
        currentValue: data.currentValue,
        purchaseValue: data.purchaseValue,
        mortgage: data.mortgageData,
      },
      tenants: data.tenants.map(t => ({
        name: t.name, email: t.email, rentAmount: t.rentAmount,
        leaseStart: t.leaseStartDate, leaseEnd: t.leaseEndDate, status: t.status,
      })),
      financials: {
        expenses: data.expenses.map(e => ({
          category: e.category, amount: e.amount, date: e.date, description: e.description,
        })),
      },
      documents: data.documents.map(d => ({
        name: d.name, type: d.type, expiresAt: d.expiresAt,
        aiSummary: d.aiSummary || 'No summary available',
      })),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new PropertyService();
