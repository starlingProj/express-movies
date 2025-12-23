const { body, param, query } = require("express-validator");
const { Import: Errors } = require("../../api/errors/movie-errors");
const MovieConstants = require("../../constants/movie-constants");

/**
 * Validation schema for creating a new movie.
 * Ensures that the required fields are present and meet the specified criteria.
 */
const movieCreateValidation = [
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("Title is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title has invalid length (expected 1–255 characters)")
    .bail()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("year")
    .exists({ checkFalsy: true })
    .withMessage("Year is required")
    .bail()
    .isInt({ min: MovieConstants.MIN_YEAR, max: MovieConstants.MAX_YEAR })
    .withMessage(`Year must be between ${MovieConstants.MIN_YEAR} and ${MovieConstants.MAX_YEAR}`)
    .bail()
    .toInt(),

  body("format")
    .exists({ checkFalsy: true })
    .withMessage("Format is required")
    .bail()
    .trim()
    .isIn(MovieConstants.VALID_FORMATS)
    .withMessage(`Format must be one of: ${MovieConstants.VALID_FORMATS.join(", ")}`),

  body("actors")
    .exists({ checkFalsy: true })
    .withMessage("Actors are required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("Actors must be an array with at least 1 actor")
    .bail()
    .custom(validateActors)
    .bail()
    .customSanitizer((actors) => {
      return actors.map(actor => actor.trim());
    })
];

/**
 * Validation schema for retrieving a movie by its ID.
 * Ensures that the `id` parameter is present, is a positive integer, and is properly formatted.
 */
const movieGetValidation = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("Movie ID is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Movie ID must be a positive integer")
    .bail()
    .toInt()
];

/**
 * Validation schema for deleting a movie by its ID.
 * Ensures that the `id` parameter is present, is a positive integer, and is properly formatted.
 */
const movieDeleteValidation = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("Movie ID is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Movie ID must be a positive integer")
    .bail()
    .toInt()
];

/**
 * Validation schema for updating a movie.
 * Ensures that the required fields are present and meet the specified criteria.
 */
const movieUpdateValidation = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("Movie ID is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Movie ID must be a positive integer")
    .bail()
    .toInt(),

  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title has invalid length (expected 1–255 characters)")
    .bail()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("year")
    .optional({ checkFalsy: true })
    .isInt({ min: MovieConstants.MIN_YEAR, max: MovieConstants.MAX_YEAR })
    .withMessage(`Year must be between ${MovieConstants.MIN_YEAR} and ${MovieConstants.MAX_YEAR}`)
    .bail()
    .toInt(),

  body("format")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(MovieConstants.VALID_FORMATS)
    .withMessage(`Format must be one of: ${MovieConstants.VALID_FORMATS.join(", ")}`),

  body("actors")
    .optional({ checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage("Actors must be an array with at least 1 actor")
    .bail()
    .custom(validateActors)
    .bail()
    .customSanitizer((actors) => {
      return actors.map(actor => actor.trim());
    })
];

/**
 * Validation schema for listing movies.
 * Ensures that the query parameters are valid and meet the specified criteria.
 */
const movieListValidation = [
  query("actor")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Actor search term cannot be empty")
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage("Actor search term has invalid length (expected 1–255 characters)"),

  query("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title search term cannot be empty")
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title search term has invalid length (expected 1–255 characters)"),

  query("search")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Search term cannot be empty")
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage("Search term has invalid length (expected 1–255 characters)"),

  query("sort")
    .optional()
    .trim()
    .isIn(["id", "title", "year"])
    .withMessage("Sort must be one of: id, title, year"),

  query("order")
    .optional()
    .trim()
    .isIn(["ASC", "DESC"])
    .withMessage("Order must be one of: ASC, DESC"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .bail()
    .toInt(),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer")
    .bail()
    .toInt()
];

/**
 * Validation schema for importing movies from a file.
 * Ensures that a file is attached to the request and that the file is not empty.
 * Throws custom errors if the file is missing or empty.
 */
const movieImportValidation = [
  body('movies')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Errors.MoviesFileMissing();
      }
      return true;
    })
    .bail()
    .custom((value, { req }) => {
      const file = req.file;

      if (file.size === 0) {
        throw new Errors.MoviesFileEmpty();
      }

      return true;
    })
    .bail()

];

/**
 * Validates an array of actor names.
 * Ensures that each actor name is a non-empty string, does not exceed the maximum length,
 * and contains only valid characters as defined by the `ACTOR_NAME_REGEX`.
 *
 * @param {Array<string>} actors - The array of actor names to validate.
 * @returns {boolean} Returns `true` if all actor names are valid.
 * @throws {Error} If any actor name is not a string, is empty, exceeds 255 characters,
 *                 or contains invalid characters.
 */
function validateActors(actors) {
  for (const actor of actors) {
    if (typeof actor !== "string") {
      throw new Error("All actors must be strings");
    }

    const name = actor.trim();

    if (!name) {
      throw new Error("Actor names cannot be empty");
    }

    if (name.length > 255) {
      throw new Error("Actor name cannot exceed 255 characters");
    }

    if (!MovieConstants.ACTOR_NAME_REGEX.test(name)) {
      throw new Error("Actor name contains invalid characters");
    }
  }

  return true;
}

module.exports = {
  movieCreateValidation,
  movieGetValidation,
  movieDeleteValidation,
  movieUpdateValidation,
  movieListValidation,
  movieImportValidation
};