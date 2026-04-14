/**
 * Standardized API Response Helpers
 */

const success = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const created = (res, data = {}, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

const serverError = (res, err) => {
  console.error('❌ Server Error:', err);
  return error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};

const paginated = (res, data, meta, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { success, created, error, unauthorized, forbidden, notFound, serverError, paginated };
