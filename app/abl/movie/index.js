const movieDao = require('../../dao/movie-sequelize-dao');

const CreateAbl = require('./create-abl');
const GetAbl = require('./get-abl');
const DeleteAbl = require('./delete-abl');
const UpdateAbl = require('./update-abl');
const ListAbl = require('./list-abl');
const ImportAbl = require('./import-abl');

/**
 * Factory function to create movie ABL instances with custom dependencies.
 * Useful for testing with mocked dependencies.
 *
 * @param {Object} [dependencies={}] - Optional dependencies to inject.
 * @param {Object} [dependencies.movieDao] - Movie DAO instance (defaults to real DAO).
 * @returns {Object} Object containing all movie ABL instances.
 */
function createMovieAbls(dependencies = {}) {
  const dao = dependencies.movieDao || movieDao;

  return {
    CreateAbl: new CreateAbl(dao),
    GetAbl: new GetAbl(dao),
    DeleteAbl: new DeleteAbl(dao),
    UpdateAbl: new UpdateAbl(dao),
    ListAbl: new ListAbl(dao),
    ImportAbl: new ImportAbl(dao),
  };
}

// Create default instances with real dependencies
const defaultAbls = createMovieAbls();

module.exports = {
  ...defaultAbls,
  createMovieAbls, // Export factory for testing
};

