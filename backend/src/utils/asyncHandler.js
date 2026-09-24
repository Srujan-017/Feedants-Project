/**
 * Wraps an async Express route handler so any rejected promise (thrown
 * ApiError or unexpected error) is forwarded to next(err) and handled
 * by the centralized error middleware, instead of crashing the process
 * or requiring a try/catch in every controller.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
