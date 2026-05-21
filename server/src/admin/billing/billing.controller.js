const prisma = require('../../lib/prisma');

exports.getBillingInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: true } }
      }
    });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const [activeSubscriptions, canceledSubscriptions, allSubscriptions] = await Promise.all([
      prisma.subscription.aggregate({ _sum: { amount: true }, where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'CANCELED' } }),
      prisma.subscription.count()
    ]);

    const mrr = activeSubscriptions._sum.amount || 0;
    const arr = mrr * 12;
    const activeSubsCount = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    
    // Simulate Churn Rate (Canceled / (Active + Canceled))
    const churnRate = allSubscriptions > 0 ? ((canceledSubscriptions / allSubscriptions) * 100).toFixed(1) : 0;

    // Generate mock 12-month time series data for MRR growth
    const today = new Date();
    const timeSeries = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - (11 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        mrr: Math.floor(mrr * 0.5 + (Math.random() * mrr * 0.5) * (i / 11)), // Simulate upward trend
      };
    });

    res.status(200).json({
      success: true,
      data: {
        mrr,
        arr,
        activeSubscriptions: activeSubsCount,
        churnRate,
        timeSeries
      }
    });
  } catch (error) {
    next(error);
  }
};
