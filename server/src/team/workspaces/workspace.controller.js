const prisma = require('../../lib/prisma');

exports.createWorkspace = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, isPrivate } = req.body;
    const userId = req.user.id;

    const workspace = await prisma.workspace.create({
      data: {
        teamId,
        name,
        description,
        isPrivate: isPrivate || false,
        members: {
          create: {
            userId,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    console.error('[Workspace Controller] Create Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Fetch workspaces the user has access to (public in team or specifically invited if private)
    const workspaces = await prisma.workspace.findMany({
      where: {
        teamId,
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } }
        ]
      },
      include: {
        _count: { select: { members: true } }
      }
    });

    res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    console.error('[Workspace Controller] Get Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
