const Errors = require("../../api/errors/user-errors").Create;
const UserDto = require("../../components/dto/user-dto");
const TokenService = require("../../components/services/token-service");
const { hashPassword } = require("../../components/services/password-service");

class CreateAbl {
  constructor(userDao) {
    this.userDao = userDao;
  }

  async create(dtoIn) {
    // Check if user with email already exists
    await this.#ensureUniqueEmail(dtoIn.email);

    // Hash the password
    const hashedPassword = await hashPassword(dtoIn.password);

    // Create user through DAO
    const user = await this.userDao.create({
      ...UserDto.prepareCreateDtoIn(dtoIn),
      password: hashedPassword
    });

    // Generate access token
    const accessToken = TokenService.generateToken({ email: user.email, id: user.id, name: user.name });

    // Return the access token
    return { token: accessToken, status: 1 };
  }

  /**
   * Ensures that the provided email is unique in the database.
   *
   * @private
   * @async
   * @param {string} email - The email to check for uniqueness.
   * @throws {Errors.EmailAlreadyExists} If a user with the given email already exists.
   */
  async #ensureUniqueEmail(email) {
    const existingUser = await this.userDao.getByEmail(email);
    if (existingUser) {
      throw new Errors.EmailAlreadyExists({ email });
    }
  }
}

module.exports = CreateAbl;