require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { CreateAbl: MovieCreateAbl, ListAbl: MovieListAbl } = require("../../../app/abl/movie");

async function seedMovies() {
  const m1 = await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves", "Carrie-Anne Moss"],
  });
  const m2 = await MovieCreateAbl.create({
    title: "John Wick",
    year: 2014,
    format: "Blu-Ray",
    actors: ["Keanu Reeves"],
  });
  const m3 = await MovieCreateAbl.create({
    title: "Speed",
    year: 1994,
    format: "VHS",
    actors: ["Sandra Bullock"],
  });

  return { m1, m2, m3 };
}

test("movie/list: returns created items + meta.total", async () => {
  await MovieCreateAbl.create({
    title: "The Matrix",
    year: 1999,
    format: "DVD",
    actors: ["Keanu Reeves"],
  });
  await MovieCreateAbl.create({
    title: "John Wick",
    year: 2014,
    format: "Blu-Ray",
    actors: ["Keanu Reeves"],
  });

  const res = await MovieListAbl.list({ limit: 10, offset: 0, sort: "id", order: "ASC" });
  assert.equal(res.status, 1);
  assert.ok(Array.isArray(res.data));
  assert.equal(res.meta?.total, 2);
});

test("movie/list: actor filter returns only matching movies", async () => {
  await seedMovies();

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    actor: "keanu",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 2);
  assert.deepEqual(
    res.data.map((m) => m.title),
    ["The Matrix", "John Wick"]
  );
});

test("movie/list: title filter matches movie title (case-insensitive)", async () => {
  await seedMovies();

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    title: "matrix",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 1);
  assert.equal(res.data[0]?.title, "The Matrix");
});

test("movie/list: search matches by actor name too", async () => {
  await seedMovies();

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    search: "sandra",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 1);
  assert.equal(res.data[0]?.title, "Speed");
});

test("movie/list: order by year DESC works", async () => {
  await seedMovies();

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "year",
    order: "DESC",
  });

  assert.equal(res.status, 1);
  assert.deepEqual(
    res.data.map((m) => m.year),
    [2014, 1999, 1994]
  );
});

test("movie/list: sort by title ASC is case-insensitive + trims", async () => {
  await MovieCreateAbl.create({
    title: "  zebra",
    year: 2001,
    format: "DVD",
    actors: ["A"],
  });
  await MovieCreateAbl.create({
    title: "Alpha",
    year: 2002,
    format: "DVD",
    actors: ["A"],
  });
  await MovieCreateAbl.create({
    title: "beta",
    year: 2003,
    format: "DVD",
    actors: ["A"],
  });

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "title",
    order: "ASC",
  });

  assert.equal(res.status, 1);
  assert.deepEqual(
    res.data.map((m) => m.title),
    ["Alpha", "beta", "  zebra"]
  );
});

test("movie/list: pagination limit/offset works (id ASC)", async () => {
  const { m1, m2, m3 } = await seedMovies();

  const res = await MovieListAbl.list({
    limit: 1,
    offset: 1,
    sort: "id",
    order: "ASC",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 3);
  assert.equal(res.data.length, 1);
  assert.equal(res.data[0]?.id, m2.data?.id);
  assert.ok(m1.data?.id < m2.data?.id && m2.data?.id < m3.data?.id);
});

