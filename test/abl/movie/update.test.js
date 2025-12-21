require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CreateAbl: MovieCreateAbl,
  UpdateAbl: MovieUpdateAbl,
  GetAbl: MovieGetAbl,
} = require("../../../app/abl/movie");

test("movie/update: happy path updates fields", async () => {
  const created = await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves"],
  });

  const id = created.data?.id;
  assert.ok(id);

  const updated = await MovieUpdateAbl.update({ id, title: "The Matrix (Updated)" });
  assert.equal(updated.status, 1);
  assert.equal(updated.data?.title, "The Matrix (Updated)");

  const got = await MovieGetAbl.get({ id });
  assert.equal(got.data?.title, "The Matrix (Updated)");
});

test("movie/update: non-existent id returns movieDoesNotExist (404)", async () => {
  await assert.rejects(
    () => MovieUpdateAbl.update({ id: 999999, title: "X" }),
    (err) => {
      assert.equal(err.code, "movieDoesNotExist");
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});

