const prisma = require('../../lib/prisma');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeBusinesses = await prisma.business.count({ where: { status: 'active' } });
    
    // Revenue simulation or query from subscriptions
    const totalRevenueResult = await prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { status: 'ACTIVE' }
    });
    
    const mrr = totalRevenueResult._sum.amount || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeBusinesses,
        mrr,
        platformHealth: 'optimal'
      }
    });
  } catch (error) {
    next(error);
  }
};
