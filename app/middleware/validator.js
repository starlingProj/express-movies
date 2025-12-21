const { validationResult, matchedData } = require('express-validator');
const { InvalidInputData } = require('../api/errors/common-errors');

/**
 * Middleware to validate request data using express-validator.
 * Runs the provided validation rules, checks for validation errors, and processes the valid data.
 *
 * @param {Array} validations - An array of validation chains from express-validator.
 * @returns {Function} Middleware function to handle validation.
 */
function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }));
      return next(new InvalidInputData({ errors: errorMessages }));
    }

    req.validatedDtoIn = matchedData(req, {
      locations: ['body', 'params', 'query'],
      includeOptionals: false
    });

    next();
  };
}

module.exports = { validate };