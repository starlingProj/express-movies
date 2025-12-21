require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: MovieCreateAbl } = require("../../../app/abl/movie");

test("movie/create: happy path returns created movie", async () => {
  const res = await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves", "Carrie-Anne Moss"],
  });

  assert.equal(res.status, 1);
  assert.ok(res.data?.id);
  assert.equal(res.data?.title, "The Matrix");
});

