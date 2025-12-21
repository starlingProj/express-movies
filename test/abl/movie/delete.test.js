require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CreateAbl: MovieCreateAbl,
  DeleteAbl: MovieDeleteAbl,
  GetAbl: MovieGetAbl,
} = require("../../../app/abl/movie");

test("movie/delete: happy path deletes movie", async () => {
  const created = await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves"],
  });

  const id = created.data?.id;
  assert.ok(id);

  const deleted = await MovieDeleteAbl.delete({ id });
  assert.equal(deleted.status, 1);

  await assert.rejects(
    () => MovieGetAbl.get({ id }),
    (err) => {
      assert.equal(err.code, "movieDoesNotExist");
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});

test("movie/delete: non-existent id returns movieDoesNotExist (404)", async () => {
  await assert.rejects(
    () => MovieDeleteAbl.delete({ id: 999999 }),
    (err) => {
      assert.equal(err.code, "movieDoesNotExist");
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});

