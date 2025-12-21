const UserModel = require('../models/user-model');

/**
 * Sequelize implementation of User DAO
 * Handles all database operations using Sequelize ORM
 */
class UserSequelizeDao {
  /**
   * Create a new user
   * @param {Object} userData - User data (username, email, password)
   * @returns {Promise<Object>} Created user as plain object
   */
  async create(userData) {
    const user = await UserModel.create(userData);
    return user.get({ plain: true });
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User as plain object or null
   */
  async getByEmail(email) {
    const user = await UserModel.findOne({ where: { email } });
    return user ? user.get({ plain: true }) : null;
  }
  
}

module.exports = new UserSequelizeDao();

