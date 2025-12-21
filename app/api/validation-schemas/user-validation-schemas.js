const { body } = require("express-validator");
const Errors = require("../errors/common-errors");

/**
 * Validation schema for creating a user.
 * Ensures that the `name`, `email`, `password`, and `confirmPassword` fields are present
 * and meet the specified criteria.
 */
const userCreateValidation = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name has invalid length (expected 2–50 characters)"),

  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Email has invalid format"),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password has invalid type (expected string)")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password has invalid length (expected at least 6 characters)"),

  body("confirmPassword")
    .exists({ checkFalsy: true })
    .withMessage("Confirm password is required")
    .bail()
    .isString()
    .withMessage("Confirm password has invalid type (expected string)")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Errors.PasswordConfirmationMismatch();
      }
      return true;
    })
];

module.exports = {
  userCreateValidation,
};
