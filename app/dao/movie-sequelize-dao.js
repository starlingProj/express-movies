const { Op } = require("sequelize");
const { MovieModel, ActorModel, sequelize } = require('../models');

const TableNameMap = {
  ACTORS: "actors",
  MOVIES: "movies",
};

/**
 * Sequelize implementation of Movie DAO
 * Handles all database operations using Sequelize ORM
 */
class MovieSequelizeDao {
  /**
   * Creates a new movie record and associates it with actors.
   * Uses a transaction to ensure atomicity - if actor association fails, movie creation is rolled back.
   * Automatically normalizes the title for search purposes.
   *
   * @async
   * @param {Object} dtoIn - The input data for creating a movie.
   * @param {string} dtoIn.title - The title of the movie.
   * @param {number} dtoIn.year - The release year of the movie.
   * @param {string} dtoIn.format - The format of the movie (e.g., "DVD", "Blu-Ray").
   * @param {Array<string>} [dtoIn.actors] - List of actor names to associate with the movie.
   * @returns {Promise<Object|null>} The created movie with its associated actors, or null if creation fails.
   */
  async create(dtoIn) {
    return sequelize.transaction(async (transaction) => {
      const { actors, ...movieFields } = dtoIn;
      movieFields.searchTitle = this.#normalizeField(movieFields.title);

      const movie = await MovieModel.create(movieFields, { transaction });

      await this.#updateActorList(movie, actors, { transaction });

      const movieWithActors = await MovieModel.findByPk(
        movie.id,
        this.#buildQueryWithActors({ transaction })
      );

      return movieWithActors ? movieWithActors.get({ plain: true }) : null;
    });
  }

  /**
   * Retrieves a movie by its ID, including associated actors.
   *
   * @async
   * @param {number} id - The ID of the movie to retrieve.
   * @returns {Promise<Object|null>} The movie with its associated actors, or null if not found.
   */
  async getById(id) {
    const movie = await MovieModel.findByPk(id, this.#buildQueryWithActors());

    return movie ? movie.get({ plain: true }) : null;
  }

  /**
   * Retrieves a list of movies by its title, year, and format, including associated actors.
   * Used for duplicate checking during movie creation.
   *
   * @async
   * @param {string} title - The title of the movie to retrieve.
   * @param {number} year - The release year of the movie.
   * @param {string} format - The format of the movie (e.g., "DVD", "Blu-Ray").
   * @returns {Promise<Array<Object>|null>} Array of movies with their associated actors, or null if none found.
   */
  async listByTitleYearAndFormat(title, year, format) {
    const movies = await MovieModel.findAll({
      where: {
        title: title.trim(),
        year: year,
        format: format.trim()
      },
      ...this.#buildQueryWithActors()
    });

    return movies?.length ? movies.map(m => m.get({ plain: true })) : null;
  }

  /**
   * Lists movies with optional filters, sorting, and pagination.
   * Supports case-insensitive search using normalized search fields.
   * For title sorting, uses in-memory sorting with locale-aware collation.
   *
   * @async
   * @param {Object} [options] - The query options.
   * @param {number} [options.limit] - The maximum number of movies to return.
   * @param {number} [options.offset] - The number of movies to skip.
   * @param {string} [options.sort] - The field to sort by ("id", "year", or "title").
   * @param {string} [options.order] - The sort order ("ASC" or "DESC").
   * @param {string} [options.title] - Filter by movie title (case-insensitive partial match).
   * @param {string} [options.actor] - Filter by actor name (case-insensitive partial match).
   * @param {string} [options.search] - Search term for movies or actors (searches both title and actor names).
   * @returns {Promise<Object>} Object containing itemList (array of movies) and total (total count matching filters).
   */
  async list({ limit, offset, sort, order, title, actor, search } = {}) {
    const where = await this.#buildMovieWhere(title, search);
    const include = this.#buildActorInclude(actor);

    const total = await MovieModel.count({
      where,
      include,
      distinct: true
    });

    let movies;
    if (sort === "title") {
      movies = await MovieModel.findAll({
        where,
        distinct: true,
        include
      });
      movies = this.#sortByTitle(movies, order);
      movies = this.#applyPagination(movies, limit, offset);
    } else {
      movies = await MovieModel.findAll({
        limit,
        offset,
        where,
        order: [[sort, order]],
        distinct: true,
        include
      });
    }

    return {
      itemList: movies.map(m => m.get({ plain: true })),
      total
    };
  }

  /**
   * Updates a movie record and its associated actors.
   * Uses a transaction to ensure atomicity - if any operation fails, all changes are rolled back.
   *
   * @async
   * @param {Object} dtoIn - The input data for updating a movie.
   * @param {number} dtoIn.id - The ID of the movie to update.
   * @param {Array<string>} [dtoIn.actors] - List of actor names to associate with the movie.
   * @param {Object} dtoIn.movieFields - Other movie fields to update.
   * @returns {Promise<Object|null>} The updated movie with its associated actors, or null if not found.
   */
  async update(dtoIn) {
    return sequelize.transaction(async (transaction) => {
      const { id, actors, ...movieFields } = dtoIn;

      const movie = await MovieModel.findByPk(id, { transaction });

      if (!movie) return null;

      if (movieFields.title) {
        movieFields.searchTitle = this.#normalizeField(movieFields.title);
      }

      await this.#updateActorList(movie, actors, { transaction });

      await movie.update(movieFields, { transaction });

      const movieWithActors = await MovieModel.findByPk(
        id,
        this.#buildQueryWithActors({ transaction })
      );

      return movieWithActors ? movieWithActors.get({ plain: true }) : null;
    });
  }

  /**
   * Deletes a movie by its ID.
   *
   * @async
   * @param {number} id - The ID of the movie to delete.
   * @returns {Promise<boolean>} True if the movie was deleted, false otherwise.
   */
  async delete(id) {
    const deletedCount = await MovieModel.destroy({
      where: { id }
    });
    return deletedCount > 0;
  }

  /**
   * Creates multiple movies and associates them with actors in a transaction.
   * Automatically filters out duplicates before creation.
   * Uses bulk operations for better performance.
   *
   * @async
   * @param {Array<Object>} movieList - List of movies to create.
   * @param {string} movieList[].title - The title of the movie.
   * @param {number} movieList[].year - The release year of the movie.
   * @param {string} movieList[].format - The format of the movie.
   * @param {Array<string>} [movieList[].actors] - List of actor names to associate.
   * @returns {Promise<Object>} Object containing itemList (created movies), total (total movies in DB), and skipped (number of duplicates filtered).
   */
  async createMany(movieList) {
    return sequelize.transaction(async (transaction) => {
      const uniqueMovies = await this.#filterDuplicates(movieList);

      if (!uniqueMovies.length) {
        return this.#buildEmptyResult(movieList.length, transaction);
      }

      const actorMap = await this.#buildActorMap(uniqueMovies, transaction);
      const movies = await this.#createMovies(uniqueMovies, transaction);
      await this.#linkMoviesToActors(movies, uniqueMovies, actorMap, transaction);

      return this.#buildResult(
        movies,
        movieList.length,
        uniqueMovies.length,
        transaction
      );
    });
  }

  // ============================================================================
  // Private methods for createMany
  // ============================================================================

  /**
   * Filters out duplicate movies from the list.
   * A movie is considered a duplicate if it has the same title, year, format, and exact set of actors.
   * Optimizes database queries by grouping movies by title+year+format before checking.
   *
   * @async
   * @private
   * @param {Array<Object>} movieList - List of movies to filter.
   * @param {string} movieList[].title - Movie title.
   * @param {number} movieList[].year - Release year.
   * @param {string} movieList[].format - Movie format.
   * @param {Array<string>} movieList[].actors - List of actor names.
   * @returns {Promise<Array<Object>>} Filtered array containing only unique movies (duplicates removed).
   */
  async #filterDuplicates(movieList) {
    if (!movieList?.length) return [];

    const normalizeActorName = (name) => name.trim().toLowerCase();
    const buildKey = (m) => `${m.title}|${m.year}|${m.format}`;

    const inputByKey = this.#groupMoviesByKey(movieList, buildKey);
    const existingByKey = await this.#loadExistingByKey(inputByKey);

    const result = [];
    for (const movie of movieList) {
      const key = buildKey(movie);
      const existing = existingByKey.get(key);

      if (!existing?.length) {
        result.push(movie);
        continue;
      }

      const inputActorSet = this.#toActorSet(movie.actors, normalizeActorName);
      const isDuplicate = this.#hasDuplicateActors(existing, inputActorSet, normalizeActorName);

      if (!isDuplicate) result.push(movie);
    }

    return result;
  }

  /**
   * Groups items in a list by a computed key.
   * Helper function for organizing movies by their title+year+format combination.
   *
   * @private
   * @param {Array} list - Array of items to group.
   * @param {Function} keyFn - Function that computes the key for each item.
   * @returns {Map<string, Array>} Map where keys are computed keys and values are arrays of items with that key.
   */
  #groupMoviesByKey(list, keyFn) {
    const map = new Map();
    for (const item of list) {
      const key = keyFn(item);
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return map;
  }

  /**
   * Loads existing movies from the database grouped by their title+year+format key.
   * Used to efficiently check for duplicates during bulk import.
   *
   * @async
   * @private
   * @param {Map<string, Array>} inputByKey - Map of keys (title|year|format) to arrays of input movies.
   * @returns {Promise<Map<string, Array<Object>>>} Map of keys to arrays of existing movies from the database.
   */
  async #loadExistingByKey(inputByKey) {
    const existingByKey = new Map();

    for (const key of inputByKey.keys()) {
      const [title, year, format] = key.split("|");
      const existing = await this.listByTitleYearAndFormat(title, Number(year), format);
      if (existing?.length) existingByKey.set(key, existing);
    }

    return existingByKey;
  }

  /**
   * Converts an array of actor names to a normalized Set.
   * Used for efficient actor comparison during duplicate checking.
   *
   * @private
   * @param {Array<string>} actorNames - Array of actor names to convert.
   * @param {Function} normalizeActorName - Function to normalize actor names (typically trim + lowercase).
   * @returns {Set<string>} Set of normalized actor names.
   */
  #toActorSet(actorNames, normalizeActorName) {
    const set = new Set();
    for (const name of actorNames || []) {
      set.add(normalizeActorName(name));
    }
    return set;
  }

  /**
   * Extracts actor names from a movie object and converts them to a normalized Set.
   * Used for comparing actors between input movies and existing movies in the database.
   *
   * @private
   * @param {Object} existingMovie - Movie object with actors array (from database).
   * @param {Array<Object>} existingMovie.actors - Array of actor objects with name property.
   * @param {Function} normalizeActorName - Function to normalize actor names (typically trim + lowercase).
   * @returns {Set<string>} Set of normalized actor names extracted from the movie.
   */
  #toActorSetFromMovie(existingMovie, normalizeActorName) {
    const set = new Set();
    for (const actor of existingMovie.actors || []) {
      set.add(normalizeActorName(actor.name));
    }
    return set;
  }

  /**
   * Checks if any existing movie has the same set of actors as the input actor set.
   * Used to determine if a movie is a duplicate based on actor matching.
   *
   * @private
   * @param {Array<Object>} existingMovies - Array of existing movies from the database.
   * @param {Set<string>} inputActorSet - Set of normalized actor names from the input movie.
   * @param {Function} normalizeActorName - Function to normalize actor names (used for extracting from existing movies).
   * @returns {boolean} True if any existing movie has matching actors, false otherwise.
   */
  #hasDuplicateActors(existingMovies, inputActorSet, normalizeActorName) {
    for (const existingMovie of existingMovies) {
      if (this.#actorsEqual(inputActorSet, this.#toActorSetFromMovie(existingMovie, normalizeActorName))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Compares two Sets of actor names for equality.
   * Two sets are equal if they have the same size and contain the same elements.
   *
   * @private
   * @param {Set<string>} firstSet - First set of normalized actor names.
   * @param {Set<string>} secondSet - Second set of normalized actor names.
   * @returns {boolean} True if both sets contain the same elements, false otherwise.
   */
  #actorsEqual(firstSet, secondSet) {
    if (firstSet.size !== secondSet.size) return false;
    for (const value of firstSet) {
      if (!secondSet.has(value)) return false;
    }
    return true;
  }

  /**
   * Builds a map of actor names to actor instances for the given movies.
   * Resolves all actor names from the movies and creates new actors if needed.
   *
   * @async
   * @private
   * @param {Array<Object>} uniqueMovies - Array of unique movies (after duplicate filtering).
   * @param {Object} transaction - Sequelize transaction object.
   * @returns {Promise<Map<string, Object>>} Map where keys are actor names and values are Sequelize actor instances.
   */
  async #buildActorMap(uniqueMovies, transaction) {
    const actorNames = uniqueMovies.flatMap(m => m.actors || []);
    return this.#resolveActorsByNames(actorNames, { transaction });
  }

  /**
   * Creates movie records in the database using bulk insert.
   * Automatically normalizes titles for search fields.
   *
   * @async
   * @private
   * @param {Array<Object>} uniqueMovies - Array of unique movies to create (after duplicate filtering).
   * @param {Object} transaction - Sequelize transaction object.
   * @returns {Promise<Array<Object>>} Array of created Sequelize movie instances with IDs.
   */
  async #createMovies(uniqueMovies, transaction) {
    const moviesToCreate = uniqueMovies.map(({ actors, ...movie }) => ({
      ...movie,
      searchTitle: this.#normalizeField(movie.title)
    }));

    return MovieModel.bulkCreate(moviesToCreate, {
      transaction,
      returning: true
    });
  }

  /**
   * Creates associations between movies and actors using bulk insert.
   * Links each created movie to its corresponding actors from the source data.
   *
   * @async
   * @private
   * @param {Array<Object>} movies - Array of created Sequelize movie instances.
   * @param {Array<Object>} uniqueMovies - Array of source movie data (used to get actor names).
   * @param {Map<string, Object>} actorMap - Map of actor names to Sequelize actor instances.
   * @param {Object} transaction - Sequelize transaction object.
   * @returns {Promise<void>}
   */
  async #linkMoviesToActors(movies, uniqueMovies, actorMap, transaction) {
    const MovieActorModel = sequelize.models.movie_actors;
    const rows = [];

    for (let i = 0; i < movies.length; i++) {
      const movieId = movies[i].id;
      const actorNames = new Set((uniqueMovies[i].actors || []).map(a => a.trim()));

      for (const name of actorNames) {
        const actor = actorMap.get(name);
        if (!actor) continue;

        rows.push({
          movieId,
          actorId: actor.id
        });
      }
    }

    if (rows.length) {
      await MovieActorModel.bulkCreate(rows, {
        transaction,
        ignoreDuplicates: true
      });
    }
  }

  /**
   * Builds the result object for createMany when all movies are duplicates.
   *
   * @async
   * @private
   * @param {number} inputLength - Total number of movies in the input list.
   * @param {Object} transaction - Sequelize transaction object.
   * @returns {Promise<Object>} Result object with empty itemList, total count, and skipped count.
   */
  async #buildEmptyResult(inputLength, transaction) {
    const total = await MovieModel.count({ transaction });
    return {
      itemList: [],
      total,
      skipped: inputLength
    };
  }

  /**
   * Builds the result object for createMany operation.
   * Removes search fields from the response and calculates skipped count.
   *
   * @async
   * @private
   * @param {Array<Object>} movies - Array of created Sequelize movie instances.
   * @param {number} inputLength - Total number of movies in the original input list.
   * @param {number} uniqueLength - Number of unique movies after duplicate filtering.
   * @param {Object} transaction - Sequelize transaction object.
   * @returns {Promise<Object>} Result object with itemList (movies without search fields), total count, and skipped count.
   */
  async #buildResult(movies, inputLength, uniqueLength, transaction) {
    const total = await MovieModel.count({ transaction });

    return {
      itemList: movies.map(m => {
        const { searchTitle, ...rest } = m.get({ plain: true });
        return rest;
      }),
      total,
      skipped: inputLength - uniqueLength
    };
  }

  // ============================================================================
  // Private methods for actor management
  // ============================================================================

  /**
   * Updates the list of actors associated with a movie.
   * Resolves actor names to instances (creates new actors if needed) and associates them.
   *
   * @async
   * @private
   * @param {Object} movie - The Sequelize movie instance.
   * @param {Array<string>} [actors] - List of actor names to associate. If empty or undefined, no changes are made.
   * @param {Object} [options] - Additional options.
   * @param {Object} [options.transaction] - The Sequelize transaction object.
   * @returns {Promise<void>}
   */
  async #updateActorList(movie, actors, { transaction } = {}) {
    if (!actors?.length) return;

    const actorMap = await this.#resolveActorsByNames(actors, { transaction });

    const actorInstances = [...actorMap.values()];

    if (actorInstances.length) {
      await movie.setActors(actorInstances, { transaction });
    }
  }

  /**
   * Resolves actor names to their corresponding instances, creating new actors if necessary.
   *
   * @async
   * @private
   * @param {Array<string>} actorNames - List of actor names to resolve.
   * @param {Object} [options] - Additional options.
   * @param {Object} [options.transaction] - The transaction object.
   * @returns {Promise<Map<string, Object>>} A map of actor names to their instances.
   */
  async #resolveActorsByNames(actorNames, { transaction } = {}) {
    const uniqueNames = [...new Set(
      (actorNames || []).map(a => a.trim())
    )];

    if (!uniqueNames.length) {
      return new Map();
    }

    const existingActors = await ActorModel.findAll({
      where: { name: uniqueNames },
      transaction
    });

    const actorMap = new Map(
      existingActors.map(a => [a.name, a])
    );

    const newActorNames = uniqueNames.filter(
      name => !actorMap.has(name)
    );

    if (newActorNames.length) {
      const actorsToCreate = newActorNames.map(name => ({
        name,
        searchName: this.#normalizeField(name)
      }));

      const createdActors = await ActorModel.bulkCreate(
        actorsToCreate,
        { transaction, returning: true }
      );

      for (const actor of createdActors) {
        actorMap.set(actor.name, actor);
      }
    }

    return actorMap;
  }

  // ============================================================================
  // Private methods for query building
  // ============================================================================

  /**
   * Builds the Sequelize where clause for filtering movies by title or search term.
   * Supports searching in both movie titles and actor names (when search parameter is used).
   * Uses normalized search fields for case-insensitive matching.
   *
   * @async
   * @private
   * @param {string} [title] - The movie title to filter by (case-insensitive partial match).
   * @param {string} [search] - The search term to filter by (searches both titles and actor names).
   * @returns {Promise<Object>} Sequelize where clause object, or empty object if no filters provided.
   */
  async #buildMovieWhere(title, search) {
    if (!title && !search) return {};

    const conditions = [];

    if (title || search) {
      const searchValue = (title || search).trim().toLowerCase();
      const searchPattern = `%${searchValue}%`;

      conditions.push({
        searchTitle: {
          [Op.like]: searchPattern
        }
      });
    }

    if (search) {
      const ids = await this.#findMovieIdsByActor(search);
      if (ids.length) {
        conditions.push({ id: { [Op.in]: ids } });
      }
    }

    if (!conditions.length) return {};
    return { [Op.or]: conditions };
  }

  /**
   * Builds the Sequelize include clause for filtering movies by actor.
   * If actor parameter is provided, adds a WHERE condition for case-insensitive search.
   *
   * @private
   * @param {string} [actor] - The actor name to filter by (case-insensitive partial match).
   * @returns {Array<Object>} Array containing the include clause configuration for Sequelize.
   */
  #buildActorInclude(actor) {
    const include = {
      model: ActorModel,
      as: TableNameMap.ACTORS,
      through: { attributes: [] },
      required: false
    };

    if (actor) {
      const searchName = actor.trim().toLowerCase();
      include.where = {
        searchName: {
          [Op.like]: `%${searchName}%`
        }
      };
      include.required = true;
    }

    return [include];
  }

  /**
   * Finds movie IDs by searching for actors matching the search term.
   * Uses normalized search field (searchName) for case-insensitive matching.
   *
   * @async
   * @private
   * @param {string} search - The search term for actor names (case-insensitive partial match).
   * @returns {Promise<Array<number>>} Array of unique movie IDs that have actors matching the search term.
   */
  async #findMovieIdsByActor(search) {
    if (!search) return [];

    const normalizedSearch = search.trim().toLowerCase();
    const searchPattern = `%${normalizedSearch}%`;

    const rows = await MovieModel.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("movie.id")), "id"]
      ],
      include: [{
        model: ActorModel,
        as: TableNameMap.ACTORS,
        attributes: [],
        where: {
          searchName: { [Op.like]: searchPattern }
        },
        through: { attributes: [] },
        required: true
      }],
      raw: true
    });

    return rows.map(r => r.id);
  }

  /**
   * Builds the standard Sequelize query options with actors included.
   * Used to ensure actors are always loaded when fetching movies.
   *
   * @private
   * @param {Object} [options={}] - Additional query options (e.g., transaction, attributes).
   * @returns {Object} Sequelize query options object with include clause for actors.
   */
  #buildQueryWithActors(options = {}) {
    return {
      include: [{
        model: ActorModel,
        as: TableNameMap.ACTORS,
        through: { attributes: [] }
      }],
      ...options
    };
  }

  // ============================================================================
  // Common private methods
  // ============================================================================

  /**
   * Normalizes a string field for case-insensitive searching.
   * Converts to lowercase and handles null/undefined values.
   *
   * @private
   * @param {string} [field] - Field value to normalize.
   * @returns {string} Normalized lowercase string, or empty string if input is falsy.
   */
  #normalizeField(field) {
    return (field || '').toLowerCase();
  }

  /**
   * Sorts movies by title using locale-aware collation.
   * Handles multiple languages including Ukrainian, English, and others.
   * Uses Intl.Collator with case-first ordering (uppercase before lowercase).
   *
   * @private
   * @param {Array<Object>} movies - Array of Sequelize movie instances.
   * @param {string} [order='ASC'] - Sort order ("ASC" or "DESC").
   * @returns {Array<Object>} New sorted array of movies (original array is not modified).
   */
  #sortByTitle(movies, order) {
    const collator = new Intl.Collator("und", {
      sensitivity: 'variant',
      caseFirst: 'upper',
      numeric: true
    });

    return [...movies].sort((a, b) => {
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      const comparison = collator.compare(titleA, titleB);
      return order === 'DESC' ? -comparison : comparison;
    });
  }

  /**
   * Applies pagination to an array by slicing it.
   * Used for in-memory pagination when sorting is done in JavaScript.
   *
   * @private
   * @param {Array} items - Array of items to paginate.
   * @param {number} limit - Maximum number of items to return.
   * @param {number} offset - Number of items to skip from the beginning.
   * @returns {Array} New array containing the paginated items (original array is not modified).
   */
  #applyPagination(items, limit, offset) {
    const start = offset;
    const end = start + limit;
    return items.slice(start, end);
  }

}

module.exports = new MovieSequelizeDao();