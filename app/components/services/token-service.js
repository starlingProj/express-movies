const jwt = require('jsonwebtoken');

class TokenService {
  /**
   * Generates a JSON Web Token (JWT) with the given payload.
   *
   * @param {Object} payload - The data to include in the token.
   * @returns {string} The generated JWT.
   */
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '45m' });
  }

  /**
   * Verifies a JSON Web Token (JWT) and decodes its payload.
   *
   * @param {string} token - The JWT to verify.
   * @returns {Object} The decoded payload of the token.
   */
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

}

module.exports = new TokenService();