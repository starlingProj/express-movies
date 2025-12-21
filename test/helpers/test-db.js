process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
process.env.PASSWORD_SALT_ROUNDS = process.env.PASSWORD_SALT_ROUNDS || "1";

const test = require("node:test");
const { sequelize } = require("../../app/models");

test.beforeEach(async () => {
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();
});

module.exports = { sequelize };

