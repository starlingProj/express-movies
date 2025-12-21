const userDao = require('../../dao/user-sequelize-dao');
const CreateAbl = require('./create-abl');

/**
 * Factory function to create session ABL instances with custom dependencies.
 * Useful for testing with mocked dependencies.
 *
 * @param {Object} [dependencies={}] - Optional dependencies to inject.
 * @param {Object} [dependencies.userDao] - User DAO instance (defaults to real DAO).
 * @returns {Object} Object containing all session ABL instances.
 */
function createSessionAbls(dependencies = {}) {
  const dao = dependencies.userDao || userDao;

  return {
    CreateAbl: new CreateAbl(dao),
  };
}

// Create default instances with real dependencies
const defaultAbls = createSessionAbls();

module.exports = {
  ...defaultAbls,
};

