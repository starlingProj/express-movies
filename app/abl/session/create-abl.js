const Errors = require("../../api/errors/session-errors").Create;
const { comparePassword } = require("../../components/services/password-service");
const TokenService = require("../../components/services/token-service");

class CreateAbl {
  constructor(userDao) {
    this.userDao = userDao;
  }

  async create(dtoIn) {
    // Check if user exists
    const user = await this.#checkUserExistence(dtoIn.email);

    // Check if password matches
    await this.#checkPasswordMatch(dtoIn.password, user.password);

    // Generate access token
    const accessToken = TokenService.generateToken({ email: user.email, id: user.id, name: user.name });

    // Return the access token
    return { token: accessToken, status: 1 };

  }

  /**
   * Checks if a user with the given email exists in the database.
   *
   * @private
   * @async
   * @param {string} email - The email of the user to check.
   * @throws {Errors.InvalidCredentials} If the user does not exist.
   * @returns {Object} The user object if it exists.
   */
  async #checkUserExistence(email) {
    const user = await this.userDao.getByEmail(email);
    if (!user) {
      throw new Errors.InvalidCredentials();
    }
    return user;
  }

  /**
   * Verifies if the provided password matches the stored password.
   *
   * @private
   * @async
   * @param {string} inputPassword - The password provided by the user.
   * @param {string} storedPassword - The password stored in the database.
   * @throws {Errors.InvalidCredentials} If the passwords do not match.
   */
  async #checkPasswordMatch(inputPassword, storedPassword) {
    if (!await comparePassword(inputPassword, storedPassword)) {
      throw new Errors.InvalidCredentials();
    }
  }

}

module.exports = CreateAbl;