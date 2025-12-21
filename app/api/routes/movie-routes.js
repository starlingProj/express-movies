const express = require('express');
const router = express.Router();
const FileUploader = require('../../middleware/file-uploader');
const MovieController = require('../controllers/movie-controller');
const Validator = require('../../middleware/validator');
const { authenticate } = require('../../middleware/auth-guard');
const {
  movieCreateValidation,
  movieGetValidation,
  movieDeleteValidation,
  movieUpdateValidation,
  movieListValidation,
  movieImportValidation
} = require('../../api/validation-schemas/movie-validation-schemas');

router.post('/movies',
  authenticate,
  Validator.validate(movieCreateValidation),
  MovieController.create
);

router.get('/movies/:id',
  authenticate,
  Validator.validate(movieGetValidation),
  MovieController.get
);

router.delete('/movies/:id',
  authenticate,
  Validator.validate(movieDeleteValidation),
  MovieController.delete
);

router.patch('/movies/:id',
  authenticate,
  Validator.validate(movieUpdateValidation),
  MovieController.update
);

router.get('/movies',
  authenticate,
  Validator.validate(movieListValidation),
  MovieController.list,
);

router.post('/movies/import',
  authenticate,
  FileUploader.upload.single('movies'),
  Validator.validate(movieImportValidation),
  MovieController.import
);
module.exports = router;

