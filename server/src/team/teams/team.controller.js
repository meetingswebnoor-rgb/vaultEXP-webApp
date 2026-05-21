const prisma = require('../../lib/prisma');

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        },
        workspaces: {
          create: {
            name: 'General',
            description: 'Default workspace',
            isPrivate: false,
            members: {
              create: {
                userId,
                role: 'admin'
              }
            }
          }
        }
      },
      include: {
        members: true,
        workspaces: true
      }
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    console.error('[Team Controller] Create Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await prisma.team.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        _count: { select: { members: true, workspaces: true } }
      }
    });
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    console.error('[Team Controller] Get Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
