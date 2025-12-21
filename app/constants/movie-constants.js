const MovieConstants = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_YEAR: 1895,
  MAX_YEAR: new Date().getFullYear() + 10, // Allow movies up to 10 years in the future
  VALID_FORMATS: ["VHS", "DVD", "Blu-Ray", "Digital"],
};

module.exports = MovieConstants;