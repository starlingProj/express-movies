const { Common: Errors } = require("../../api/errors/movie-errors");

class UpdateAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async update(dtoIn) {
    // Update movie
    const movieData = await this.movieDao.update(dtoIn);
    if (!movieData) {
      throw new Errors.MovieDoesNotExist({ movieId: dtoIn.id });
    }

    // Return movie data
    return { data: movieData, status: 1 };
  }

}

module.exports = UpdateAbl;