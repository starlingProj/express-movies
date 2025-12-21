const { Common: Errors } = require("../../api/errors/movie-errors");

class DeleteAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async delete(dtoIn) {
    // Delete movie
    const result = await this.movieDao.delete(dtoIn.id);
    if (!result) {
      throw new Errors.MovieDoesNotExist({ movieId: dtoIn.id });
    }

    // Return status
    return { status: 1 };
  }

}

module.exports = DeleteAbl;