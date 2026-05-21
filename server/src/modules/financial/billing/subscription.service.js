/**
 * Subscription Billing Service
 * Manages recurring subscriptions and the automated generation of invoices.
 */

const prisma = require('../../../lib/prisma');

class SubscriptionService {
  async createSubscription(userId, data) {
    // Generate the subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        businessId: data.businessId || null,
        planName: data.planName,
        amount: data.amount,
        currency: data.currency || 'USD',
        interval: data.interval || 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date(data.nextBillingDate || Date.now())
      }
    });

    return subscription;
  }

  async getSubscriptions(userId, filters = {}) {
    return await prisma.subscription.findMany({
      where: { userId, ...filters },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getClientSubscriptions(businessId) {
    return await prisma.subscription.findMany({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { nextBillingDate: 'asc' }
    });
  }

  async processRenewals(userId) {
    const today = new Date();
    
    // Find all subscriptions that are ACTIVE and due for renewal today or earlier
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        nextBillingDate: { lte: today }
      }
    });

    const results = [];

    for (const sub of dueSubscriptions) {
      // 1. Generate an Invoice
      const invoice = await prisma.invoice.create({
        data: {
          userId: sub.userId,
          businessId: sub.businessId,
          number: `SUB-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          status: 'sent', // Auto-sent
          currency: sub.currency,
          dueDate: new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)), // Due in 7 days
          subtotal: sub.amount,
          taxTotal: 0,
          total: sub.amount,
          notes: `Auto-generated invoice for subscription: ${sub.planName} (${sub.interval})`,
        }
      });

      // 2. Generate Invoice Items
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: `Subscription: ${sub.planName} (${sub.interval})`,
          quantity: 1,
          rate: sub.amount,
          amount: sub.amount
        }
      });

      // 3. Advance the Next Billing Date
      const nextDate = new Date(sub.nextBillingDate);
      if (sub.interval === 'MONTHLY') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (sub.interval === 'YEARLY') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: nextDate }
      });

      results.push({ subscriptionId: sub.id, generatedInvoiceId: invoice.id, nextBillingDate: nextDate });
    }

    return { processedCount: dueSubscriptions.length, results };
  }

  async cancelSubscription(userId, id) {
    return await prisma.subscription.update({
      where: { id, userId },
      data: { status: 'CANCELED' }
    });
  }
}

module.exports = new SubscriptionService();
