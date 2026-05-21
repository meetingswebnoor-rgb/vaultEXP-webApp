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

  // Prisma connection error
  if (err.code?.startsWith('P1')) {
    statusCode = 503;
    message = 'Database connection failed';
    errorCode = 'DB_CONNECTION_ERROR';
  }

  // Prisma schema / table missing
  if (err.code === 'P2021' || err.code === 'P2022') {
    statusCode = 500;
    message = 'Database schema out of sync';
    errorCode = 'SCHEMA_MISMATCH';
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
