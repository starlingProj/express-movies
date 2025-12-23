const MovieDto = require("../../components/dto/movie-dto");
const { Create: Errors } = require("../../api/errors/movie-errors");

class CreateAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async create(dtoIn) {
    // Check for duplicate movie
    await this.#ensureNoDuplicate(dtoIn);

    // Create movie
    const movieData = await this.movieDao.create(MovieDto.prepareCreateDtoIn(dtoIn));

    // Return created movie data
    return { data: movieData, status: 1 };
  }

  /**
   * Ensures that there are no duplicate movies with the same title, year, format, and actors.
   *
   * @async
   * @private
   * @param {Object} dtoIn - The input data for the movie.
   * @param {string} dtoIn.title - The title of the movie.
   * @param {number} dtoIn.year - The release year of the movie.
   * @param {string} dtoIn.format - The format of the movie (e.g., DVD, Blu-ray).
   * @param {Array<string>} dtoIn.actors - The list of actor names associated with the movie.
   * @throws {Errors.MovieAlreadyExists} If a movie with the same title, year, format, and actors already exists.
   */
  async #ensureNoDuplicate({ title, year, format, actors }) {
    const movieList = await this.movieDao.listByTitleYearAndFormat(title, year, format);
    if (!movieList?.length) return;

    const normalize = (name) => name.trim().toLowerCase();

    const inputActorSet = new Set(actors.map(normalize));

    for (const movie of movieList) {
      const movieActorSet = new Set(
        movie.actors.map(a => normalize(a.name))
      );

      if (movieActorSet.size !== inputActorSet.size) continue;

      const isSameActors = [...inputActorSet].every(actor =>
        movieActorSet.has(actor)
      );

      if (isSameActors) {
        throw new Errors.MovieAlreadyExists({ title, year, format, actors });
      }
    }
  }
}

module.exports = CreateAbl;