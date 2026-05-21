const prisma = require('../../lib/prisma');

exports.getFlaggedContent = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};
