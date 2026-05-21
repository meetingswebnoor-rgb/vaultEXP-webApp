/**
 * expense.service.js (property module)
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Property Expenses via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');
const eventBus = require('../../lib/eventBus');

class ExpenseService {
  async _assertPropertyOwner(propertyId, userId) {
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });
    if (!prop || prop.userId !== userId) {
      throw new AppError('Property not found or access denied', 404);
    }
  }

  async create(userId, propertyId, body) {
    await this._assertPropertyOwner(propertyId, userId);

    if (!body.amount)   throw new AppError('Amount is required', 422);
    if (!body.category) throw new AppError('Category is required', 422);

    const expense = await prisma.expense.create({
      data: {
        userId,
        propertyId,
        amount: parseFloat(body.amount),
        currency: body.currency || 'USD',
        category: body.category || 'other_property',
        date: body.date ? new Date(body.date) : new Date(),
        description: body.note || body.description,
        vendor: body.vendor,
        paymentMethod: body.paymentMethod,
        receiptUrl: body.receiptUrl,
        isRecurring: !!body.isRecurring,
        recurrenceRule: body.recurrenceRule || body.recurrenceInterval,
      },
    });

    eventBus.emit('expense.created', { expenseId: expense.id, propertyId, userId, amount: expense.amount });

    return expense;
  }

  async list(userId, propertyId) {
    await this._assertPropertyOwner(propertyId, userId);
    return await prisma.expense.findMany({
      where: { propertyId, userId },
      orderBy: { date: 'desc' },
    });
  }

  async getById(userId, expenseId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense || expense.userId !== userId) {
      throw new AppError('Expense not found', 404);
    }
    return expense;
  }

  async update(userId, expenseId, body) {
    const existing = await this.getById(userId, expenseId);

    const updateData = { ...body };
    delete updateData.id;
    delete updateData.propertyId;
    delete updateData.businessId;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
    if (updateData.date)   updateData.date = new Date(updateData.date);
    if (updateData.note !== undefined) {
      updateData.description = updateData.note;
      delete updateData.note;
    }
    if (updateData.recurrenceInterval !== undefined) {
      updateData.recurrenceRule = updateData.recurrenceInterval;
      delete updateData.recurrenceInterval;
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });


    return updated;
  }

  async delete(userId, expenseId) {
    await this.getById(userId, expenseId);

    await prisma.expense.delete({
      where: { id: expenseId },
    });


    return { deleted: true };
  }
}

module.exports = new ExpenseService();
