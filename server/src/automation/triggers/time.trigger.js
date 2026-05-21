const prisma = require('../../lib/prisma');
const engine = require('../engine/automation.engine');

class TimeTrigger {
  /**
   * Evaluates date-based thresholds globally across all tables.
   */
  async evaluateDaily() {
    console.log('[TimeTrigger] Evaluating daily time-based triggers...');
    const now = new Date();
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const startOfDay = new Date(thirtyDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(thirtyDaysFromNow.setHours(23, 59, 59, 999));

    try {
      // 1. Lease Expires in 30 Days
      // Queries the Prisma Tenant model for leases ending exactly in 30 days
      const expiringLeases = await prisma.tenant.findMany({
        where: {
          leaseEndDate: { gte: startOfDay, lt: endOfDay }
        },
        include: { property: true }
      });
      for (const tenant of expiringLeases) {
        await engine.handleTrigger('lease.expiring_30_days', { 
          tenantId: tenant.id, 
          propertyId: tenant.propertyId, 
          userId: tenant.property ? tenant.property.userId : null,
          name: tenant.name, 
          leaseEndDate: tenant.leaseEndDate 
        });
      }

      // 2. Invoice Overdue
      // Queries all invoices where dueDate has passed and status is not paid
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { notIn: ['paid', 'void'] }
        },
        include: { business: true } // Assuming invoice connects to business which connects to user
      });
      for (const invoice of overdueInvoices) {
        await engine.handleTrigger('invoice.overdue', { 
          invoiceId: invoice.id, 
          amount: invoice.amount, 
          userId: invoice.business ? invoice.business.userId : null,
          client: invoice.clientName, 
          dueDate: invoice.dueDate 
        });
      }
      
      // 3. Missing Documents
      // For example, checking if active tenants lack a lease document
      const activeTenants = await prisma.tenant.findMany({
        where: { status: 'active' },
        include: { property: true }
      });
      // We emit an event for tenants to have AI check their missing docs, or just emit a system trigger
      for (const tenant of activeTenants) {
        // Just simulating a document check trigger
        await engine.handleTrigger('document.missing_check', {
          tenantId: tenant.id,
          propertyId: tenant.propertyId,
          userId: tenant.property.userId,
          name: tenant.name
        });
      }

      // 4. Recurring Expenses
      const recurringExpenses = await prisma.expense.findMany({
        where: {
          isRecurring: true
          // Next recurrence date check logic would go here
        }
      });
      // Emit trigger to process recurring expenses
      for (const expense of recurringExpenses) {
        await engine.handleTrigger('expense.recurring_due', {
          expenseId: expense.id,
          propertyId: expense.propertyId,
          userId: expense.userId,
          amount: expense.amount,
          category: expense.category
        });
      }

      // 5. Monthly AI Financial Review (Cash flow, Budgets, Tax)
      // We can emit a system-wide trigger for all active users once a month.
      // Assuming today is the end of the month or we evaluate it dynamically.
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      for (const user of allUsers) {
        await engine.handleTrigger('finance.monthly_review', {
          userId: user.id
        });
      }

      // 6. Rent Reminders
      // Notify tenants 3 days before their payment is due
      const today = new Date().getDate();
      const upcomingDueDay = (today + 3) > 31 ? ((today + 3) % 31) || 1 : today + 3;
      
      const tenantsDueSoon = await prisma.tenant.findMany({
        where: { status: 'active', paymentDueDay: upcomingDueDay },
        include: { property: true }
      });
      
      for (const tenant of tenantsDueSoon) {
        await engine.handleTrigger('tenant.rent_due_reminder', {
          tenantId: tenant.id,
          propertyId: tenant.propertyId,
          userId: tenant.property.userId,
          name: tenant.name,
          rentAmount: tenant.rentAmount,
          dueDate: upcomingDueDay
        });
      }

      // 7. Monthly AI Property & Tenant Analysis
      // Predicts late payments, lease risks, and maintenance patterns
      for (const user of allUsers) {
        await engine.handleTrigger('property.ai_risk_analysis', {
          userId: user.id
        });
      }

      console.log(`[TimeTrigger] Dispatched ${expiringLeases.length} lease expirations, ${overdueInvoices.length} overdue invoice events, ${activeTenants.length} missing document checks, ${recurringExpenses.length} recurring expenses, ${allUsers.length} financial reviews, ${tenantsDueSoon.length} rent reminders, and ${allUsers.length} property risk analyses.`);
    } catch (err) {
      console.error('[TimeTrigger] Evaluation failed:', err);
    }
  }
}

module.exports = new TimeTrigger();
