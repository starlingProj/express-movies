const { CreateAbl } = require('../../abl/user');

/**
 * Controller for handling user-related operations.
 */
class UserController {
  static async create(req, res) {
    const result = await CreateAbl.create(req.validatedDtoIn);
    res.status(201).json(result);
  }
}

module.exports = UserController;
