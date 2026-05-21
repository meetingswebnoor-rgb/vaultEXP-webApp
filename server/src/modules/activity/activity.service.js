const prisma = require('../../lib/prisma');

const getActivities = async (filters) => {
  const { userId, module, action, limit = 50 } = filters;

  const where = {};
  if (userId) where.userId = userId;
  if (module) where.module = module;
  if (action) where.action = action;

  // Since we don't have deeply integrated RBAC for this demo, 
  // we return global activities, but you would normally filter by team/workspace membership here.
  
  return await prisma.activityLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit, 10)
  });
};

module.exports = {
  getActivities
};
