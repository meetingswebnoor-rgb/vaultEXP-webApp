const { AppError } = require('../utils/appError');

/**
 * Role-based access control middleware
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (req.user.role !== 'SUPER_ADMIN' && !roles.includes(req.user.role)) {
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
