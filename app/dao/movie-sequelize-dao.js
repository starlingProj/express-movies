const { Op, fn, col, where, } = require("sequelize");
const { MovieModel, ActorModel, sequelize } = require('../models');

/**
 * Sequelize implementation of Movie DAO
 * Handles all database operations using Sequelize ORM
 */
class MovieSequelizeDao {
  /**
   * Creates a new movie record and associates it with actors.
   * Uses a transaction to ensure atomicity - if actor association fails, movie creation is rolled back.
   *
   * @async
   * @param {Object} dtoIn - The input data for creating a movie.
   * @param {Array<string>} dtoIn.actors - List of actor names to associate with the movie.
   * @param {Object} dtoIn.movieFields - Other movie fields.
   * @returns {Promise<Object>} The created movie with its associated actors.
   */
  async create(dtoIn) {
    return sequelize.transaction(async (transaction) => {
      const { actors, ...movieFields } = dtoIn;
      const movie = await MovieModel.create(movieFields, { transaction });

      await this.#updateActorList(movie, actors, { transaction });

      // Return the created movie with actors
      const movieWithActors = await MovieModel.findByPk(movie.id, {
        include: [{
          model: ActorModel,
          as: 'actors',
          through: { attributes: [] }
        }],
        transaction
      });

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
    const movie = await MovieModel.findByPk(id, {
      include: [{
        model: ActorModel,
        as: 'actors',
        through: { attributes: [] }
      }]
    });

    return movie ? movie.get({ plain: true }) : null;
  }

  /**
   * Lists movies with optional filters, sorting, and pagination.
   *
   * @async
   * @param {Object} [options] - The query options.
   * @param {number} [options.limit] - The maximum number of movies to return.
   * @param {number} [options.offset] - The number of movies to skip.
   * @param {string} [options.sort] - The field to sort by.
   * @param {string} [options.order] - The sort order ('ASC' or 'DESC').
   * @param {string} [options.title] - Filter by movie title.
   * @param {string} [options.actor] - Filter by actor name.
   * @param {string} [options.search] - Search term for movies or actors.
   * @returns {Promise<Object>} The list of movies and the total count.
   */
  async list({ limit, offset, sort, order, title, actor, search } = {}) {
    const where = await this.#buildListMovieWhere(title, search);
    const include = this.#buildListActorIncludes(actor);

    const total = await MovieModel.count({
      where,
      include,
      distinct: true
    });

    const movies = await MovieModel.findAll({
      limit: Number(limit),
      offset: Number(offset),
      where,
      order: this.#buildOrderClause(sort, order),
      distinct: true,
      include
    });

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

      await this.#updateActorList(movie, actors, { transaction });

      await movie.update(movieFields, { transaction });

      // Return the updated movie with actors
      const movieWithActors = await MovieModel.findByPk(id, {
        include: [{
          model: ActorModel,
          as: 'actors',
          through: { attributes: [] }
        }],
        transaction
      });

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
   *
   * @async
   * @param {Array<Object>} movieList - List of movies to create.
   * @returns {Promise<Object>} The created movies and the total count.
   */
  async createMany(movieList) {
    return sequelize.transaction(async (transaction) => {

      const allActorNames = movieList.flatMap(m => m.actors || []);
      const actorMap = await this.#resolveActorsByNames(allActorNames, { transaction });

      const movies = await MovieModel.bulkCreate(
        movieList.map(({ actors, ...movie }) => movie),
        { transaction, returning: true }
      );

      for (let i = 0; i < movies.length; i++) {
        const uniqueMovieActors = [...new Set(
          (movieList[i].actors || []).map(a => a.trim())
        )];

        const actorInstances = uniqueMovieActors
          .map(name => actorMap.get(name))
          .filter(Boolean);

        if (actorInstances.length) {
          await movies[i].setActors(actorInstances, { transaction });
        }
      }
      const total = await MovieModel.count({ transaction });

      return { itemList: movies.map(m => m.get({ plain: true })), total };
    });
  }

  /**
   * Updates the list of actors associated with a movie.
   *
   * @async
   * @private
   * @param {Object} movie - The movie instance.
   * @param {Array<string>} actors - List of actor names to associate.
   * @param {Object} [options] - Additional options.
   * @param {Object} [options.transaction] - The transaction object.
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
      const createdActors = await ActorModel.bulkCreate(
        newActorNames.map(name => ({ name })),
        { transaction, returning: true }
      );

      for (const actor of createdActors) {
        actorMap.set(actor.name, actor);
      }
    }

    return actorMap;
  }

  /**
   * Builds the order clause for sorting movies.
   *
   * @private
   * @param {string} sort - The field to sort by.
   * @param {string} order - The sort order ('ASC' or 'DESC').
   * @returns {Array} The order clause.
   */
  #buildOrderClause(sort, order) {
    if (sort === "title") {
      return [
        [
          fn(
            "LOWER",
            fn("TRIM", col("Movie.title"))
          ),
          order
        ]
      ];
    } else {
      return [[sort, order]];
    }
  }

  /**
   * Builds the include clause for filtering movies by actor.
   *
   * @private
   * @param {string} actor - The actor name to filter by.
   * @returns {Array<Object>} The include clause.
   */
  #buildListActorIncludes(actor) {
    const include = {
      model: ActorModel,
      as: "actors",
      through: { attributes: [] },
      required: false
    };

    if (actor) {
      include.where = {
        name: {
          [Op.like]: `%${actor.trim().toLowerCase()}%`
        }
      };
      include.required = true;
    }

    return [include];
  }

  /**
   * Builds the where clause for filtering movies by title or search term.
   *
   * @async
   * @private
   * @param {string} title - The movie title to filter by.
   * @param {string} search - The search term to filter by.
   * @returns {Promise<Object>} The where clause.
   */
  async #buildListMovieWhere(title, search) {
    if (!title && !search) return {};

    const conditions = [];

    if (title || search) {
      const value = `%${(title || search).trim().toLowerCase()}%`;

      conditions.push(
        where(
          fn("LOWER", fn("TRIM", col("Movie.title"))),
          { [Op.like]: value }
        )
      );
    }

    if (search) {
      const ids = await this.#findMovieIdsByActorSearch(search);
      if (ids.length) {
        conditions.push({ id: { [Op.in]: ids } });
      }
    }

    return { [Op.or]: conditions };
  }

  /**
   * Finds movie IDs by searching for actors matching the search term.
   *
   * @async
   * @private
   * @param {string} search - The search term for actor names.
   * @returns {Promise<Array<number>>} The list of movie IDs.
   */
  async #findMovieIdsByActorSearch(search) {
    if (!search) return [];

    const actors = await ActorModel.findAll({
      attributes: [],
      where: {
        name: {
          [Op.like]: `%${search.trim().toLowerCase()}%`
        }
      },
      include: [{
        model: MovieModel,
        as: "movies",
        attributes: ["id"],
        through: { attributes: [] }
      }]
    });

    return [...new Set(
      actors.flatMap(a => a.movies.map(m => m.id))
    )];
  }

}

module.exports = new MovieSequelizeDao();