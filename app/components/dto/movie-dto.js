const DefaultValueMap = {
  limit: 20,
  offset: 0,
  sort: "id",
  order: "ASC",
};

/**
 * Data Transfer Object (DTO) for movies.
 * Provides methods to prepare input data for various operations.
 */
class MovieDto {
  /**
   * Prepares the DTO for creating a movie.
   *
   * @param {Object} dtoIn - The input data for creating a movie.
   * @param {string} dtoIn.title - The title of the movie.
   * @param {number} dtoIn.year - The release year of the movie.
   * @param {string} dtoIn.format - The format of the movie (e.g., DVD, Blu-ray).
   * @param {string[]} dtoIn.actors - The list of actors in the movie.
   * @returns {Object} The prepared DTO for creating a movie.
   */
  prepareCreateDtoIn(dtoIn) {
    return {
      title: dtoIn.title,
      year: dtoIn.year,
      format: dtoIn.format,
      actors: dtoIn.actors,
    };
  }

  /**
   * Prepares the DTO for importing a movie.
   *
   * @param {Object} dtoIn - The input data for importing a movie.
   * @param {string} dtoIn.title - The title of the movie.
   * @param {number} dtoIn.releaseYear - The release year of the movie.
   * @param {string} dtoIn.format - The format of the movie (e.g., DVD, Blu-ray).
   * @param {string} dtoIn.stars - A comma-separated string of actor names.
   * @returns {Object} The prepared DTO for importing a movie.
   */
  prepareImportDtoIn(dtoIn) {
    return {
      title: dtoIn.title,
      year: dtoIn.releaseYear,
      format: dtoIn.format,
      actors: dtoIn.stars.split(",").map(a => a.trim()).filter(Boolean),
    };
  }

  /**
   * Prepares the DTO for listing movies.
   *
   * @param {Object} dtoIn - The input data for listing movies.
   * @param {number} [dtoIn.limit] - The number of items per page.
   * @param {number} [dtoIn.offset] - The starting point for pagination.
   * @param {string} [dtoIn.sort] - The field to sort by.
   * @param {string} [dtoIn.order] - The sorting order (ASC or DESC).
   * @param {string} [dtoIn.title] - The title to filter movies by.
   * @param {string} [dtoIn.actor] - The actor to filter movies by.
   * @param {string} [dtoIn.search] - A search term to filter movies.
   * @returns {Object} The prepared DTO for listing movies.
   */
  prepareListDtoIn(dtoIn) {
    return {
      limit: dtoIn.limit || DefaultValueMap.limit,
      offset: dtoIn.offset || DefaultValueMap.offset,
      sort: dtoIn.sort || DefaultValueMap.sort,
      order: dtoIn.order || DefaultValueMap.order,
      title: dtoIn.title,
      actor: dtoIn.actor,
      search: dtoIn.search,
    };
  }

}

module.exports = new MovieDto();