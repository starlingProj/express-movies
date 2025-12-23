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

test("movie/list: sort by title ASC works with Ukrainian characters", async () => {
  const titles = ["А-тест", "а-тест", "Б-тест", "б-тест", "Ґ-тест", "ґ-тест", "Я-тест", "я-тест"];

  for (const title of titles) {
    await MovieCreateAbl.create({
      title,
      year: 2011,
      format: "DVD",
      actors: ["Актор"],
    });
  }

  const res = await MovieListAbl.list({
    limit: 50,
    offset: 0,
    sort: "title",
    order: "ASC",
  });

  assert.equal(res.status, 1);
  const got = res.data.map((m) => m.title);

  // Expected order must mirror DAO implementation (Intl.Collator settings + trim in comparator).
  const collator = new Intl.Collator("und", {
    sensitivity: "variant",
    caseFirst: "upper",
    numeric: true,
  });
  const expected = [...titles].sort((a, b) => collator.compare(a.trim(), b.trim()));

  assert.deepEqual(got, expected);

  // Extra sanity checks: upper-case comes before lower-case for same base letter.
  assert.ok(got.indexOf("А-тест") < got.indexOf("а-тест"));
  assert.ok(got.indexOf("Ґ-тест") < got.indexOf("ґ-тест"));
});

test("movie/list: Ukrainian title filter is case-insensitive (matches А/а)", async () => {
  await MovieCreateAbl.create({
    title: "А-тест",
    year: 2011,
    format: "DVD",
    actors: ["Актор"],
  });
  await MovieCreateAbl.create({
    title: "а-тест",
    year: 2011,
    format: "DVD",
    actors: ["Актор"],
  });
  await MovieCreateAbl.create({
    title: "Б-тест",
    year: 2011,
    format: "DVD",
    actors: ["Актор"],
  });

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    title: "а",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 2);
  assert.deepEqual(res.data.map((m) => m.title), ["А-тест", "а-тест"]);
});

test("movie/list: Ukrainian actor filter is case-insensitive", async () => {
  await MovieCreateAbl.create({
    title: "Фільм 1",
    year: 2011,
    format: "DVD",
    actors: ["Іван Петренко"],
  });
  await MovieCreateAbl.create({
    title: "Фільм 2",
    year: 2011,
    format: "DVD",
    actors: ["Петро Іваненко"],
  });

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    actor: "іван",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 2);
});

test("movie/list: Ukrainian search matches by actor name too", async () => {
  await MovieCreateAbl.create({
    title: "Не містить ключового слова",
    year: 2011,
    format: "DVD",
    actors: ["Іван Петренко"],
  });
  await MovieCreateAbl.create({
    title: "Інший фільм",
    year: 2011,
    format: "DVD",
    actors: ["Хтось інший"],
  });

  const res = await MovieListAbl.list({
    limit: 10,
    offset: 0,
    sort: "id",
    order: "ASC",
    search: "іван",
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.total, 1);
  assert.equal(res.data[0]?.title, "Не містить ключового слова");
});

