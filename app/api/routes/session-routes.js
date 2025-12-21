const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/session-controller');
const Validator = require('../../middleware/validator');
const {
  sessionCreateValidation,
} = require('../../api/validation-schemas/session-validation-schemas');

router.post('/sessions', Validator.validate(sessionCreateValidation), SessionController.create);

module.exports = router;

