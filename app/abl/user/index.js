const userDao = require('../../dao/user-sequelize-dao');
const CreateAbl = require('./create-abl');

/**
 * Factory function to create user ABL instances with custom dependencies.
 * Useful for testing with mocked dependencies.
 *
 * @param {Object} [dependencies={}] - Optional dependencies to inject.
 * @param {Object} [dependencies.userDao] - User DAO instance (defaults to real DAO).
 * @returns {Object} Object containing all user ABL instances.
 */
function createUserAbls(dependencies = {}) {
  const dao = dependencies.userDao || userDao;

  return {
    CreateAbl: new CreateAbl(dao),
  };
}

// Create default instances with real dependencies
const defaultAbls = createUserAbls();

module.exports = {
  ...defaultAbls,
};





