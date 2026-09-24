/**
 * A small error class that carries an HTTP status code, so services can
 * throw a specific, meaningful error (400/404/409) and the existing
 * centralized error middleware (which already reads err.statusCode /
 * err.message) will translate it into the right JSON response without
 * any controller-specific error handling.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
