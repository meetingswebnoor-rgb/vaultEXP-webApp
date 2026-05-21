const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isApproved: true,
        isActive: true,
        clearanceLevel: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        isApproved: true,
        isActive: true,
        approvedById: req.user.id,
        approvedAt: new Date(),
        // Assign default clearance based on role if not already set appropriately
      }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, clearanceLevel } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        clearanceLevel
      }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.changeUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        status
      }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
