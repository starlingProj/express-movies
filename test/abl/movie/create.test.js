require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: MovieCreateAbl } = require("../../../app/abl/movie");
const assertRejectsWith = require("../../helpers/assert-rejects-with");

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

test("movie/create: duplicate (same title/year/format + same actors set) throws movieAlreadyExists (409)", async () => {
  await MovieCreateAbl.create({
    title: "А-тест",
    year: 2011,
    format: "Blu-Ray",
    actors: ["Іван Петренко", "Marta"],
  });

  await assertRejectsWith(
    () =>
      MovieCreateAbl.create({
        title: "А-тест",
        year: 2011,
        format: "Blu-Ray",
        // Same set, different order + casing + whitespace
        actors: [" marta ", "іван петренко"],
      }),
    { code: "movieAlreadyExists", statusCode: 409 }
  );
});

test("movie/create: not a duplicate when at least one field differs (format differs)", async () => {
  await MovieCreateAbl.create({
    title: "А-тест",
    year: 2011,
    format: "DVD",
    actors: ["Іван Петренко"],
  });

  const res = await MovieCreateAbl.create({
    title: "А-тест",
    year: 2011,
    format: "Blu-Ray",
    actors: ["Іван Петренко"],
  });

  assert.equal(res.status, 1);
  assert.ok(res.data?.id);
 });

