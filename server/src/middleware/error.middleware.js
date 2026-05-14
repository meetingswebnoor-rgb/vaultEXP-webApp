const logger = require('../utils/logger');
const { AppError } = require('../utils/appError');

/**
 * Global error handler - must be last middleware
 */
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target || 'Field';
    message = `${field} already exists`;
    errorCode = 'DUPLICATE_KEY';
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorCode = 'NOT_FOUND';
  }

  // Prisma foreign key constraint failed
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record not found';
    errorCode = 'FOREIGN_KEY_FAILED';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
