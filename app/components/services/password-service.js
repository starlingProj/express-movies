const bcrypt = require('bcrypt');

class PasswordService {
  /**
   * Hashes a plain text password using bcrypt.
   *
   * @async
   * @param {string} plainPassword - The plain text password to be hashed.
   * @returns {Promise<string>} The hashed password.
   */
  static async hashPassword(plainPassword) {
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password to check if they match.
   *
   * @async
   * @param {string} plainPassword - The plain text password to compare.
   * @param {string} hashedPassword - The hashed password to compare against.
   * @returns {Promise<boolean>} True if the passwords match, false otherwise.
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = PasswordService;
