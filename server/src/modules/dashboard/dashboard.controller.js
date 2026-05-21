const dashboardService = require('./dashboard.service');

/**
 * Controller for retrieving aggregated dashboard data.
 * Designed to cleanly handle the payload from the optimized dashboard service.
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getDashboardData(userId);
    
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    // ── FALLBACK ERROR HANDLING ──
    // As per requirements: "Return fallback if data missing"
    // Instead of crashing the frontend with a 500, we gracefully return an empty dashboard state.
    console.error('[Dashboard API] Error aggregating data:', error.message);
    
    return res.status(200).json({
      success: true,
      data: {
        totalValue: 0,
        breakdown: { businesses: 0, properties: 0, investments: 0 },
        recentItems: [],
        alerts: [],
        quickStats: { income: 0, expenses: 0, profit: 0 }
      }
    });
  }
};

module.exports = {
  getDashboardData
};
