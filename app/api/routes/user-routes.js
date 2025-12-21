const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const Validator = require('../../middleware/validator');
const {
  userCreateValidation,
} = require('../../api/validation-schemas/user-validation-schemas');

router.post('/users', Validator.validate(userCreateValidation), UserController.create);

module.exports = router;





