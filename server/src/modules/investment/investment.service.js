/**
 * investment.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Investments via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class InvestmentService {

  // ── CREATE ────────────────────────────────────────────────────
  async create(userId, body) {
    if (!body.name) throw new AppError('Investment name is required', 422);
    if (body.amountInvested === undefined) throw new AppError('Amount invested is required', 422);

    const investment = await prisma.investment.create({
      data: {
        userId,
        name: body.name,
        ticker: body.ticker,
        type: body.type || 'manual_asset',
        status: body.status || 'active',
        platform: body.platform,
        currency: body.currency || 'USD',
        quantity: body.quantity ? parseFloat(body.quantity) : null,
        avgBuyPrice: body.avgBuyPrice ? parseFloat(body.avgBuyPrice) : null,
        amountInvested: parseFloat(body.amountInvested),
        currentValue: body.currentValue ? parseFloat(body.currentValue) : parseFloat(body.amountInvested),
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
        riskLevel: body.riskLevel ? parseInt(body.riskLevel, 10) : null,
        goalTag: body.goalTag,
        notes: body.notes,
      },
    });


    return investment;
  }

  // ── LIST ──────────────────────────────────────────────────────
  async list(userId, query = {}) {
    const { status, type } = query;
    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    return await prisma.investment.findMany({
      where,
      orderBy: { purchaseDate: 'desc' },
    });
  }

  // ── GET BY ID ─────────────────────────────────────────────────
  async getById(userId, investmentId) {
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment || investment.userId !== userId) {
      throw new AppError('Investment not found or access denied', 404);
    }

    return investment;
  }

  // ── UPDATE ────────────────────────────────────────────────────
  async update(userId, investmentId, body) {
    const existing = await prisma.investment.findUnique({
      where: { id: investmentId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Investment not found or access denied', 404);
    }

    const updateData = { ...body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.quantity) updateData.quantity = parseFloat(updateData.quantity);
    if (updateData.avgBuyPrice) updateData.avgBuyPrice = parseFloat(updateData.avgBuyPrice);
    if (updateData.amountInvested) updateData.amountInvested = parseFloat(updateData.amountInvested);
    if (updateData.currentValue) updateData.currentValue = parseFloat(updateData.currentValue);
    if (updateData.realizedGain) updateData.realizedGain = parseFloat(updateData.realizedGain);
    if (updateData.purchaseDate) updateData.purchaseDate = new Date(updateData.purchaseDate);
    if (updateData.sellDate) updateData.sellDate = new Date(updateData.sellDate);
    if (updateData.riskLevel) updateData.riskLevel = parseInt(updateData.riskLevel, 10);

    const investment = await prisma.investment.update({
      where: { id: investmentId },
      data: updateData,
    });


    return investment;
  }

  // ── DELETE ────────────────────────────────────────────────────
  async delete(userId, investmentId) {
    const existing = await prisma.investment.findUnique({
      where: { id: investmentId },
      select: { userId: true, name: true },
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Investment not found or access denied', 404);
    }

    await prisma.investment.delete({
      where: { id: investmentId },
    });


    return { deleted: true, name: existing.name };
  }

  // ── ANALYTICS / ENGINE ────────────────────────────────────────
  async getAnalytics(userId) {
    const investments = await prisma.investment.findMany({
      where: { userId },
      select: { type: true, amountInvested: true, currentValue: true, status: true, realizedGain: true }
    });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalRealizedGain = 0;
    const distribution = {};

    investments.forEach(inv => {
      const invested = parseFloat(inv.amountInvested || 0);
      const current = parseFloat(inv.currentValue || 0);
      const realized = parseFloat(inv.realizedGain || 0);

      totalInvested += invested;
      totalCurrentValue += current;
      totalRealizedGain += realized;

      if (!distribution[inv.type]) distribution[inv.type] = 0;
      distribution[inv.type] += current;
    });

    const totalUnrealizedGain = totalCurrentValue - totalInvested;
    const totalProfit = totalUnrealizedGain + totalRealizedGain;
    const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfit,
      totalUnrealizedGain,
      totalRealizedGain,
      roi: roi.toFixed(2),
      distribution, // Portfolio composition by asset type
    };
  }
}

module.exports = new InvestmentService();
