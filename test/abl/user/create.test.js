require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: UserCreateAbl } = require("../../../app/abl/user");

test("user/create: happy path returns token", async () => {
  const res = await UserCreateAbl.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  assert.equal(res.status, 1);
  assert.ok(res.token);
});

test("user/create: duplicate email returns emailAlreadyExists (409)", async () => {
  await UserCreateAbl.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  await assert.rejects(
    () =>
      UserCreateAbl.create({
        name: "Another User",
        email: "test@example.com",
        password: "password123",
      }),
    (err) => {
      assert.equal(err.code, "emailAlreadyExists");
      assert.equal(err.statusCode, 409);
      return true;
    }
  );
});

