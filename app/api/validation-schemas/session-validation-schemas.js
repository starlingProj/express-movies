const { body } = require("express-validator");

/**
 * Validation schema for creating a session.
 * Ensures that the `email` and `password` fields are present and meet the specified criteria.
 */
const sessionCreateValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email has invalid type (expected string)")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Email has invalid format"),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password has invalid type (expected string)"),
];

module.exports = {
  sessionCreateValidation,
};
