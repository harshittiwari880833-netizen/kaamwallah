const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');

/**
 * Authenticate request via JWT Bearer token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, phone, role, language }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired. Please refresh.');
    }
    return unauthorized(res, 'Invalid token');
  }
};

/**
 * Role-based access control
 * Usage: authorize('client') or authorize('labour') or authorize('client', 'labour')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, doesn't fail if absent
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.split(' ')[1]);
    } catch {
      req.user = null;
    }
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
