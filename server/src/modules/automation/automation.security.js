const rateLimit = require('express-rate-limit');
const prisma = require('../../lib/prisma');

/**
 * 1. Rate Limiting: Prevent spamming automation engine
 */
exports.automationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many automation requests created from this IP, please try again after 15 minutes.'
  }
});

/**
 * 2. Workflow Permission Validation
 * Ensures the user has the correct subscription tier or role to run advanced workflows.
 */
exports.requireWorkflowPermission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // In a real app, you would check `req.user.subscriptionTier` or role.
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    
    // Example: Only premium/admin can trigger heavy AI workflows manually
    if (req.body.isAdvancedAI && user.role !== 'admin' && user.role !== 'premium') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Advanced AI workflows require a premium subscription.'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Security] Workflow Permission Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authorization' });
  }
};

/**
 * 3. Action Authorization (Data Scoping)
 * Ensures users cannot trigger workflows that access/modify other users' data.
 */
exports.validateActionAuthorization = async (req, res, next) => {
  try {
    const { resourceId, resourceType } = req.body;
    const userId = req.user.id;

    if (!resourceId || !resourceType) {
      // If it's a global user-level workflow, we just rely on req.user.id which is secure.
      return next();
    }

    // Verify ownership of the resource before allowing the automation to run
    let isOwner = false;
    
    switch (resourceType) {
      case 'property':
        const prop = await prisma.property.findFirst({ where: { id: resourceId, userId } });
        isOwner = !!prop;
        break;
      case 'tenant':
        const tenant = await prisma.tenant.findFirst({
          where: { id: resourceId, property: { userId } }
        });
        isOwner = !!tenant;
        break;
      case 'document':
        const doc = await prisma.document.findFirst({ where: { id: resourceId, userId } });
        isOwner = !!doc;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid resource type for automation.' });
    }

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Action Authorization Failed: You do not own this resource.'
      });
    }

    next();
  } catch (error) {
    console.error('[Security] Action Authorization Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authorization' });
  }
};
