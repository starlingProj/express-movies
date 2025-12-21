const MainError = require("./main-error");

const Create = {
  EmailAlreadyExists: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "Email already exists",
        code: "emailAlreadyExists",
        statusCode: 409,
        paramMap
      });
    }
  }
};

module.exports = { Create };