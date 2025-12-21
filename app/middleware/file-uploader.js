const multer = require('multer');
const { Import } = require('../api/errors/movie-errors');
const MovieConstants = require('../constants/movie-constants');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MovieConstants.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    /**
     * Custom file filter to validate uploaded files.
     * Only allows files with specific MIME types and extensions.
     */
    const allowedMimeTypes = ['text/plain'];
    const allowedExtensions = ['.txt'];

    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.some(ext =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (!isValidMimeType || !isValidExtension) {
      return cb(new Import.InvalidFileType({
        fileName: file.originalname,
        mimeType: file.mimetype,
        expectedMimeTypes: allowedMimeTypes,
        expectedExtensions: allowedExtensions
      }), false);
    }

    cb(null, true);
  }
});

module.exports = { upload };