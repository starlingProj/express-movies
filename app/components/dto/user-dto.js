/**
 * Data Transfer Object (DTO) for users.
 * Provides methods to prepare input data for various operations.
 */
class UserDto {
  /**
   * Prepares the Data Transfer Object (DTO) for creating a user.
   * Structures the input data (password hashing is done in ABL layer).
   *
   * @param {Object} dtoIn - The input data for creating a user.
   * @param {string} dtoIn.name - The name of the user.
   * @param {string} dtoIn.password - The plain text password of the user.
   * @param {string} dtoIn.email - The email address of the user.
   * @returns {Object} The prepared DTO for creating a user.
   */
  prepareCreateDtoIn(dtoIn) {
    return {
      name: dtoIn.name,
      password: dtoIn.password,
      email: dtoIn.email,
    };
  }

}

module.exports = new UserDto();