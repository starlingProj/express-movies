const MainError = require("./main-error");

class InvalidInputData extends MainError {
  constructor(paramMap = {}) {
    super({ message: "Invalid input data", code: "invalidInputData", paramMap });
  }
}

class PasswordConfirmationMismatch extends MainError {
  constructor(paramMap = {}) {
    super({
      message: "Password confirmation does not match password",
      code: "passwordConfirmationMismatch",
      statusCode: 400,
      paramMap
    });
  }
}

class Unauthorized extends MainError {
  constructor(paramMap = {}) {
    super({
      message: "Unauthorized",
      code: "unauthorized",
      statusCode: 401,
      paramMap
    });
  }
}

class InvalidToken extends MainError {
  constructor(paramMap = {}) {
    super({
      message: "Invalid or expired token",
      code: "invalidToken",
      statusCode: 401,
      paramMap
    });
  }
}

class TokenMissing extends MainError {
  constructor(paramMap = {}) {
    super({
      message: "Authentication token is required",
      code: "tokenMissing",
      statusCode: 401,
      paramMap
    });
  }
}

class NotFound extends MainError {
  constructor(paramMap = {}) {
    super({
      message: "Resource not found",
      code: "notFound",
      statusCode: 404,
      paramMap
    });
  }
}

module.exports = { InvalidInputData, PasswordConfirmationMismatch, InvalidToken, TokenMissing, Unauthorized, NotFound };