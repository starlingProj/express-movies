require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: MovieCreateAbl, GetAbl: MovieGetAbl } = require("../../../app/abl/movie");

test("movie/get: happy path returns movie by id", async () => {
  const created = await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves"],
  });

  const id = created.data?.id;
  assert.ok(id);

  const res = await MovieGetAbl.get({ id });
  assert.equal(res.status, 1);
  assert.equal(res.data?.id, id);
  assert.equal(res.data?.title, "The Matrix");
});

test("movie/get: non-existent id returns movieDoesNotExist (404)", async () => {
  await assert.rejects(
    () => MovieGetAbl.get({ id: 999999 }),
    (err) => {
      assert.equal(err.code, "movieDoesNotExist");
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});

