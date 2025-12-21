const MovieDto = require("../../components/dto/movie-dto");
const { Import } = require("../../api/errors/movie-errors");
const { toCamelCase } = require("../../components/helpers/text-helper");
const MovieConstants = require("../../constants/movie-constants");

const MOVIE_FILE_TEXT_FIELDS = ["Title", "Release Year", "Format", "Stars"];
const ACTOR_NAME_REGEX = /^[a-zA-ZÀ-ž.'\- ]+$/;

class ImportAbl {
  constructor(movieDao) {
    this.movieDao = movieDao;
  }

  async import(dtoIn) {
    // Parse and validate the movies file
    const createManyMoviesDtoIn = this.#parseMoviesFile(dtoIn.file);

    // Bulk create movies
    const { itemList, total } = await this.movieDao.createMany(createManyMoviesDtoIn);

    // Return import result
    return {
      data: itemList,
      meta: { imported: createManyMoviesDtoIn.length, total },
      status: 1
    };
  }

  /**
   * Parses the content of a movies file and converts it into an array of movie objects.
   *
   * @private
   * @param {Object} file - The file object containing the movies data.
   * @param {Buffer} file.buffer - The buffer of the file content.
   * @throws {Import.InvalidFileContent} If a movie block is invalid.
   * @throws {Import.MoviesMissingRequiredFields} If required fields are missing in a movie block.
   * @returns {Object[]} An array of movie objects prepared for import.
   */
  #parseMoviesFile(file) {
    const fileContent = file.buffer.toString('utf-8');

    const lines = fileContent.split(/\r?\n/);
    const movies = [];
    let block = [];

    const flushBlock = () => {
      if (!block.length) return;

      const parsed = this.#parseMovieBlock(block);
      this.#validateMovieBlock(parsed);
      movies.push(MovieDto.prepareImportDtoIn(parsed));

      block = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushBlock();
      } else {
        block.push(line);
      }
    }

    // Process the last block in case the file does not end with an empty line
    flushBlock();

    return movies;
  }

  /**
   * Parses a block of text representing a movie and extracts its fields.
   *
   * @private
   * @param {string[]} block - An array of strings representing the lines of a movie block.
   * @throws {Import.InvalidFileContent} If the block does not contain the exact required fields.
   * @throws {Import.MoviesMissingRequiredFields} If any required fields are missing in the block.
   * @returns {Object} An object containing the parsed movie fields with camelCase keys.
   */
  #parseMovieBlock(block) {
    const parsedBlock = {};
    const missingFields = [];

    if (Object.values(block).length !== MOVIE_FILE_TEXT_FIELDS.length) {
      throw new Import.InvalidFileContent({
        block,
        errorDetail: `Movie block must contain exactly [${MOVIE_FILE_TEXT_FIELDS.join(", ")}] fields`
      });
    }

    for (const field of MOVIE_FILE_TEXT_FIELDS) {
      const prefix = `${field.toLowerCase()}:`;

      const line = block.find(line =>
        line.toLowerCase().startsWith(prefix)
      );

      if (!line) {
        missingFields.push(field);
        continue;
      }

      parsedBlock[toCamelCase(field)] = line
        .slice(prefix.length)
        .trim();
    }

    if (missingFields.length > 0) {
      throw new Import.MoviesMissingRequiredFields({
        missingFields,
        textBlock: block
      });
    }
    return parsedBlock;
  }

  /**
   * Validates the properties of a movie block object.
   *
   * @private
   * @param {Object} textBlock - The movie block object to validate.
   * @param {string} textBlock.releaseYear - The release year of the movie.
   * @param {string} textBlock.format - The format of the movie (e.g., VHS, DVD, Blu-Ray).
   * @param {string} textBlock.stars - A comma-separated list of actor names.
   * @param {string} textBlock.title - The title of the movie.
   * @throws {Import.InvalidInputData} If the release year is invalid.
   * @throws {Import.InvalidFileContent} If the format, stars, or title are invalid.
   */
  #validateMovieBlock(textBlock) {
    // Release year validation
    const year = parseInt(textBlock.releaseYear, 10);
    if (!Number.isInteger(year) || year < MovieConstants.MIN_YEAR || year > MovieConstants.MAX_YEAR) {
      throw new Import.InvalidInputData({
        textBlock,
        errorDetail: `Release year must be a number between ${MovieConstants.MIN_YEAR} and ${MovieConstants.MAX_YEAR}`
      });
    }

    // Format validation
    if (!MovieConstants.VALID_FORMATS.includes(textBlock.format)) {
      throw new Import.InvalidFileContent({
        textBlock,
        errorDetail: `Invalid format`,
        expectedValues: MovieConstants.VALID_FORMATS
      });
    }

    // Stars validation
    const actors = textBlock.stars
      .split(",")
      .map(a => a.trim())
      .filter(Boolean);

    if (!actors?.length) {
      throw new Import.InvalidFileContent({
        textBlock,
        errorDetail: `Stars field cannot be empty`
      });
    }

    for (const actor of actors) {
      if (actor.length > 255) {
        throw new Import.InvalidFileContent({
          textBlock,
          errorDetail: `Actor name is too long: "${actor}"`
        });
      }

      if (!ACTOR_NAME_REGEX.test(actor)) {
        throw new Import.InvalidFileContent({
          textBlock,
          errorDetail: `Actor name contains invalid characters: "${actor}"`
        });
      }
    }

    // Title validation
    if (!textBlock.title?.length) {
      throw new Import.InvalidFileContent({
        textBlock,
        errorDetail: "Title cannot be empty"
      });
    }
    if (textBlock.title.length > 255) {
      throw new Import.InvalidFileContent({
        textBlock,
        errorDetail: "Title exceeds maximum length of 255 characters"
      });
    }
  }

}

module.exports = ImportAbl;