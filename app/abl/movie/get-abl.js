const { Common: Errors } = require("../../api/errors/movie-errors");

class GetAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async get(dtoIn) {
    // Check movie existence
    const movie = await this.movieDao.getById(dtoIn.id);
    if (!movie) {
      throw new Errors.MovieDoesNotExist({ movieId: dtoIn.id });
    }

    // Return movie data
    return { data: movie, status: 1 };
  }

}

module.exports = GetAbl;