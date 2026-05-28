const prisma = require('../../lib/prisma');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, status, role, subscriptionId } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (status) where.status = status;
    if (role) where.role = role;
    // If subscriptionId filter is passed, we normally query it. 
    // Commented out temporarily until Prisma schema generate succeeds.
    // if (subscriptionId) {
    //   where.subscriptions = {
    //     some: { id: subscriptionId, status: 'active' }
    //   };
    // }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        isVerified: true
        // subscriptions: {
        //   where: { status: 'active' },
        //   include: { plan: true }
        // }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        // subscriptions: {
        //   include: { plan: true }
        // },
        workspaceMembers: {
          include: { workspace: true }
        },
        aiProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate total document storage used across user's documents
    const documents = await prisma.document.aggregate({
      where: { userId: id },
      _sum: { size: true }
    });
    
    // Aggregate activities (if you have an activity table, else we use standard counts)
    const stats = {
      totalStorageBytes: documents._sum.size || 0,
      totalWorkspaces: user.workspaceMembers?.length || 0,
      activeSubscription: user.subscriptions?.find(s => s.status === 'active') || null
    };

    res.status(200).json({ success: true, data: { user, stats } });
  } catch (error) {
    next(error);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
