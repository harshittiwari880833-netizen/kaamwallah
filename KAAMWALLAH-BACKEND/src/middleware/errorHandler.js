const { serverError } = require('../utils/response');

/**
 * Global error handler — must be last middleware registered
 */
const errorHandler = (err, req, res, next) => {
  // Postgres duplicate key
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry — resource already exists',
      detail: process.env.NODE_ENV !== 'production' ? err.detail : undefined,
    });
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
    });
  }

  // Postgres check constraint
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Value violates database constraint',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  return serverError(res, err);
};

/**
 * 404 handler — catch unmatched routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
