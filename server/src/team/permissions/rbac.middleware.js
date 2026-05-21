const prisma = require('../../lib/prisma');
const { hasPermission } = require('./rbac.matrix');

/**
 * Access Validation Middleware
 * Checks if the user has a specific permission within the context of a Team.
 */
exports.requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      // Depending on route design, teamId can be in params, body, or query
      const teamId = req.params.teamId || req.body.teamId || req.query.teamId;

      if (!teamId) {
        return res.status(400).json({ success: false, message: 'teamId is required for permission validation.' });
      }

      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId, userId }
        }
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: 'Access denied. You do not belong to this team.' });
      }

      const isAllowed = hasPermission(membership.role, requiredPermission);

      if (!isAllowed) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Your role '${membership.role}' lacks the '${requiredPermission}' permission.` 
        });
      }

      req.teamMembership = membership; // Attach for downstream controllers
      next();
    } catch (error) {
      console.error('[RBAC Middleware] Error:', error);
      res.status(500).json({ success: false, message: 'Authorization error' });
    }
  };
};
