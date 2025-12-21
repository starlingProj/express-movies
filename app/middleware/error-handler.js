const multer = require("multer");
const { Import } = require("../api/errors/movie-errors");
const MovieConstants = require("../constants/movie-constants");

/**
 * Centralized error handling middleware
 * Handles all application errors and returns appropriate HTTP responses
 */
const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeMulterError(err);

  logServerError(normalizedError, req);

  const { statusCode, body } = buildErrorResponse(normalizedError);

  res.status(statusCode).json(body);
};

/**
 * Normalizes errors thrown by Multer, converting them into application-specific error objects.
 *
 * @param {Error} err - The error object to normalize.
 */
function normalizeMulterError(err) {
  if (!(err instanceof multer.MulterError)) return err;

  if (err.code === "LIMIT_FILE_SIZE") {
    return new Import.FileSizeExceeded({
      maxFileSize: MovieConstants.MAX_FILE_SIZE
    });
  }

  return new Import.MoviesFileUploadFailed({
    reason: err.code
  });
}

/**
 * Builds a standardized error response object for HTTP responses.
 *
 * @param {Error} err - The error object to build the response from.
 * @returns {Object} - An object containing the HTTP status code and response body.
 * @property {number} statusCode - The HTTP status code.
 * @property {Object} body - The response body containing error details.
 * @property {string} body.error - The error code.
 * @property {string} body.message - The error message.
 * @property {Object} body.paramMap - Additional error details or parameters.
 */
function buildErrorResponse(err) {
  return {
    statusCode: err.statusCode || err.status || 500,
    body: {
      error: err.code || "InternalServerError",
      message: err.message || "Internal Server Error",
      paramMap: err.paramMap || err.errors || {}
    }
  };
}

/**
 * Logs server errors to the console for debugging purposes.
 * Only logs errors with a status code of 500 or higher.
 *
 * @param {Error} err - The error object to log.
 * @param {Object} req - The HTTP request object.
 * @param {string} req.path - The path of the request.
 * @param {string} req.method - The HTTP method of the request.
 */
function logServerError(err, req) {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode < 500) return;

  console.error("Server Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode
  });
}

module.exports = errorHandler;





