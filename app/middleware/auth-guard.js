const TokenService = require('../components/services/token-service');
const Errors = require('../api/errors/common-errors');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
function authenticate(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new Errors.TokenMissing());

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return next(new Errors.InvalidToken());
  const token = parts[1];

  if (!token) return next(new Errors.TokenMissing());

  try {
    req.user = TokenService.verifyToken(token);
    return next();
  } catch {
    return next(new Errors.InvalidToken());
  }

}

module.exports = { authenticate };