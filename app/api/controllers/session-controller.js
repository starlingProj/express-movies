const { CreateAbl } = require('../../abl/session');

/**
 * Controller for handling session-related operations.
 */
class SessionController {
  static async create(req, res) {
    const result = await CreateAbl.create(req.validatedDtoIn);
    res.status(201).json(result);
  }
}

module.exports = SessionController;
