const prisma = require('../../lib/prisma');

/**
 * Validates if a user has the appropriate role within a team to perform an action.
 */
exports.requireTeamRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const teamId = req.params.teamId || req.body.teamId;

      if (!teamId) {
        return res.status(400).json({ success: false, message: 'teamId is required for authorization.' });
      }

      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId, userId }
        }
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: 'Access denied. Not a member of this team.' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ success: false, message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.` });
      }

      req.teamMembership = membership;
      next();
    } catch (error) {
      console.error('[Permission Guard] Error:', error);
      res.status(500).json({ success: false, message: 'Authorization error' });
    }
  };
};
