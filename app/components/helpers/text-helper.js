/**
 * Converts a string to camelCase.
 * Removes extra spaces, converts the string to lowercase, and capitalizes the first letter
 * of each word except the first one.
 *
 * @param {string} value - The input string to be converted.
 * @returns {string} The camelCase formatted string.
 */
function toCamelCase(value) {
  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word
        : word[0].toUpperCase() + word.slice(1)
    )
    .join("");
}

module.exports = {
  toCamelCase
};