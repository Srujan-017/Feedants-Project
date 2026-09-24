/**
 * 404 handler for any /api/* route that doesn't match a defined route.
 * Must be registered AFTER all real routes.
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

/**
 * Centralized error handler.
 * - Always returns JSON.
 * - Never leaks stack traces or internal details to the client.
 * - Logs the real error server-side for debugging.
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  // Defense-in-depth: the services validate ObjectId format and check
  // for duplicate-key (11000) errors themselves before they'd normally
  // reach here, but these two generic mappings mean a raw Mongoose
  // CastError or an unanticipated duplicate-key error still never
  // leaks to the client as a raw 500.
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate entry' });
  }

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
