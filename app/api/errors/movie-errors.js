const MainError = require("./main-error");

const Common = {
  MovieDoesNotExist: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "Movie does not exist",
        code: "movieDoesNotExist",
        statusCode: 404,
        paramMap
      });
    }
  }
};

const Import = {
  MoviesFileMissing: class extends MainError {
    constructor(paramMap = {}) {
      super({ message: "Movies file is missing", code: "moviesFileMissing", paramMap });
    }
  },

  InvalidFileType: class extends MainError {
    constructor(paramMap = {}) {
      super({ message: `Invalid file type.`, code: "invalidFileType", paramMap });
    }
  },

  FileSizeExceeded: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "File size exceeded the maximum limit",
        code: "fileSizeExceeded",
        statusCode: 413,
        paramMap
      });
    }
  },

  MoviesFileEmpty: class extends MainError {
    constructor(paramMap = {}) {
      super({ message: "Movies file is empty", code: "moviesFileEmpty", paramMap });
    }
  },

  InvalidFileContent: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "File contains invalid content",
        code: "invalidFileContent",
        paramMap
      });
    }
  },
  MoviesMissingRequiredFields: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "One or more movies have missing required fields",
        code: "moviesMissingRequiredFields",
        paramMap
      });
    }
  },
  InvalidInputData: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "Invalid input data",
        code: "invalidInputData",
        paramMap
      });
    }
  },
  MoviesFileUploadFailed: class extends MainError {
    constructor(paramMap = {}) {
      super({
        message: "Movies file upload failed",
        code: "moviesFileUploadFailed",
        paramMap
      });
    }
  }
};

module.exports = { Common, Import };