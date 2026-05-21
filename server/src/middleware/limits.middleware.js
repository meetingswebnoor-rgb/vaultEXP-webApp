const prisma = require('../../prisma');

exports.checkLimit = (limitType) => {
  return async (req, res, next) => {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: { plan: true }
      });

      if (!subscription || !subscription.plan) {
        return res.status(403).json({ success: false, message: 'Active subscription required.' });
      }

      let isExceeded = false;

      switch (limitType) {
        case 'storage':
          isExceeded = subscription.storageUsed >= subscription.plan.maxStorage;
          break;
        case 'aiTokens':
          isExceeded = subscription.aiTokensUsed >= subscription.plan.maxAiTokens;
          break;
        case 'automation':
          isExceeded = subscription.automationRuns >= subscription.plan.maxAutomation;
          break;
        case 'team':
          isExceeded = subscription.teamMembers >= subscription.plan.maxTeamMembers;
          break;
        case 'uploads':
          isExceeded = subscription.uploadsCount >= subscription.plan.maxUploads;
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid limit type.' });
      }

      if (isExceeded) {
        return res.status(403).json({ 
          success: false, 
          message: `Plan limit exceeded for ${limitType}. Please upgrade your plan.` 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

exports.incrementUsage = async (userId, limitType, amount = 1) => {
  try {
    const fieldMap = {
      storage: 'storageUsed',
      aiTokens: 'aiTokensUsed',
      automation: 'automationRuns',
      team: 'teamMembers',
      uploads: 'uploadsCount',
    };

    const field = fieldMap[limitType];
    if (!field) return;

    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: {
        [field]: { increment: amount }
      }
    });
  } catch (error) {
    console.error(`Failed to increment ${limitType} for user ${userId}`, error);
  }
};

exports.requireFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: { plan: true }
      });

      if (!subscription || !subscription.plan) {
        return res.status(403).json({ success: false, message: 'Active subscription required for this feature.' });
      }

      if (subscription.plan[featureKey] !== true) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your current plan does not include this feature. Please upgrade your plan to gain access.',
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
