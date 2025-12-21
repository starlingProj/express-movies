const { Sequelize } = require("sequelize");
const path = require("path");

/**
 * Initializes a Sequelize instance configured for SQLite.
 */
const getStoragePath = () => {
  if (process.env.NODE_ENV === "test") {
    return ":memory:";
  }

  if (process.env.DB_STORAGE) {
    return process.env.DB_STORAGE;
  }

  return path.resolve(__dirname, "dev.sqlite");
};

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: getStoragePath(),
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
});

module.exports = sequelize;
