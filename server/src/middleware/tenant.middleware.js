const prisma = require('../lib/prisma');

exports.requireTenant = async (req, res, next) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Missing x-workspace-id header' });
    }

    // Verify user is a member of this workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.user.id
        }
      },
      include: { workspace: true }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
    }

    // Inject the isolated workspace context into the request
    req.workspace = membership.workspace;
    req.workspaceRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};
