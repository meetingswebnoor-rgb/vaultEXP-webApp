/**
 * Async Wrapper Utility
 * 
 * Eliminates the need for try/catch blocks in controllers.
 * Errors are automatically caught and passed to the global error handler.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
module.exports.catchAsync = catchAsync;
