const { AppError } = require('../utils/appError');

const CLEARANCE_LEVELS = {
  SUPER_ADMIN: 10,
  ADMIN: 7,
  CLIENT: 3,
  USER: 1
};

/**
 * Role-based access control middleware
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    const userRole = req.user.role;
    const userLevel = CLEARANCE_LEVELS[userRole] || 0;
    const requiredLevel = roles.length > 0 ? Math.min(...roles.map(r => CLEARANCE_LEVELS[r] || 99)) : 0;
    
    const hasRole = roles.includes(userRole);
    const hasClearance = userLevel >= requiredLevel;

    if (userRole !== 'SUPER_ADMIN' && !hasRole && !hasClearance) {
      return next(
        new AppError(
          `Access denied. Requires one of: ${roles.join(', ')}`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }
    next();
  };
}

module.exports = { authorize };
