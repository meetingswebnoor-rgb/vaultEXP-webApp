/**
 * analytics.controller.js
 * ─────────────────────────────────────────────────────────────────
 * Mongoose / MongoDB aggregation pipeline REMOVED.
 * Pending MySQL migration.
 *
 * TODO: Replace stubs with mysql2/promise queries.
 *
 * MySQL queries:
 *   SELECT SUM(amount) FROM invoices WHERE business_id = ? AND status = 'paid'
 *   SELECT SUM(amount) FROM expenses WHERE business_id = ?
 *   SELECT MONTH(paid_at), YEAR(paid_at), SUM(amount) FROM invoices … GROUP BY …
 */
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');
const { AppError } = require('../../utils/appError');

// ── DB Stub ────────────────────────────────────────────────────
const db = {
  businesses: { findOne: async (f) => null },
  invoices: {
    sumPaid: async (businessId) => 0,            // SUM(amount) WHERE business_id = ? AND status = 'paid'
    monthlyRevenue: async (businessId, since) => [], // GROUP BY MONTH/YEAR
  },
  expenses: {
    sumAll: async (businessId) => 0,             // SUM(amount) WHERE business_id = ?
    monthlyExpenses: async (businessId, since) => [],
  },
};

// ── GET /api/analytics/business/:businessId ────────────────────
exports.getBusinessAnalytics = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  // TODO: SELECT * FROM businesses WHERE id = ? AND owner_id = ?
  const business = await db.businesses.findOne({ id: businessId, ownerId: req.user.id });
  if (!business) return next(new AppError('Business not found or unauthorized', 404));

  // TODO: SELECT SUM(amount) FROM invoices WHERE business_id = ? AND status = 'paid'
  const totalRevenue = await db.invoices.sumPaid(businessId);
  // TODO: SELECT SUM(amount) FROM expenses WHERE business_id = ?
  const totalExpenses = await db.expenses.sumAll(businessId);
  const profit = totalRevenue - totalExpenses;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // TODO: SELECT MONTH(paid_at) AS month, YEAR(paid_at) AS year, SUM(amount) AS total
  //        FROM invoices WHERE business_id = ? AND status = 'paid' AND paid_at >= ?
  //        GROUP BY year, month ORDER BY year ASC, month ASC
  const monthlyRevenueData  = await db.invoices.monthlyRevenue(businessId, sixMonthsAgo);
  // TODO: SELECT MONTH(date) AS month, YEAR(date) AS year, SUM(amount) AS total
  //        FROM expenses WHERE business_id = ? AND date >= ?
  //        GROUP BY year, month ORDER BY year ASC, month ASC
  const monthlyExpensesData = await db.expenses.monthlyExpenses(businessId, sixMonthsAgo);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const rev = monthlyRevenueData.find(r => r.month === m && r.year === y)?.total || 0;
    const exp = monthlyExpensesData.find(e => e.month === m && e.year === y)?.total || 0;

    chartData.push({
      name:     months[m - 1],
      revenue:  rev,
      expenses: exp,
      profit:   rev - exp,
    });
  }

  res.status(200).json(new ApiResponse(200, {
    summary: {
      totalRevenue,
      totalExpenses,
      profit,
      margin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
    },
    chartData,
  }, 'Analytics retrieved'));
});
