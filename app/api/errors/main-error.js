class MainError extends Error {
  constructor({ message, code, statusCode = 400, paramMap = {} }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.paramMap = paramMap;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = MainError;