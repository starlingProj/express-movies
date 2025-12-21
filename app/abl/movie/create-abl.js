const MovieDto = require("../../components/dto/movie-dto");

class CreateAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async create(dtoIn) {
    // Create movie
    const movieData = await this.movieDao.create(MovieDto.prepareCreateDtoIn(dtoIn));

    // Return created movie data
    return { data: movieData, status: 1 };
  }
}

module.exports = CreateAbl;