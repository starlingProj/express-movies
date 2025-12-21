const MainError = require("./main-error");

const Create = {
  InvalidCredentials: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "Invalid credentials",
        code: "invalidCredentials",
        statusCode: 401,
        paramMap
      });
    }
  }
};

module.exports = { Create };