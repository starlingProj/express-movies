require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: UserCreateAbl } = require("../../../app/abl/user");
const { CreateAbl: SessionCreateAbl } = require("../../../app/abl/session");

test("session/create: happy path returns token", async () => {
  await UserCreateAbl.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  const res = await SessionCreateAbl.create({
    email: "test@example.com",
    password: "password123",
  });

  assert.equal(res.status, 1);
  assert.ok(res.token);
});

test("session/create: invalid password returns invalidCredentials (401)", async () => {
  await UserCreateAbl.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  await assert.rejects(
    () => SessionCreateAbl.create({ email: "test@example.com", password: "wrong" }),
    (err) => {
      assert.equal(err.code, "invalidCredentials");
      assert.equal(err.statusCode, 401);
      return true;
    }
  );
});

