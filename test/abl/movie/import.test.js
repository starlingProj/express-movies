require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { ImportAbl: MovieImportAbl } = require("../../../app/abl/movie");

test("movie/import: happy path imports one movie", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: DVD",
    "Stars: Keanu Reeves, Carrie-Anne Moss",
    "",
  ].join("\n");

  const res = await MovieImportAbl.import({
    file: { buffer: Buffer.from(content, "utf-8") },
  });

  assert.equal(res.status, 1);
  assert.equal(res.meta?.imported, 1);
  assert.ok(Array.isArray(res.data));
});

test("movie/import: missing required fields throws moviesMissingRequiredFields", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Formatttttt: DVD",
    "Stars: Keanu Reeves, Carrie-Anne Moss",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "moviesMissingRequiredFields");
      return true;
    }
  );
});

test("movie/import: wrong number of fields throws invalidFileContent", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: DVD",
    // missing Stars line -> only 3 fields
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: invalid year throws invalidInputData", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1500",
    "Format: DVD",
    "Stars: Keanu Reeves",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidInputData");
      return true;
    }
  );
});

test("movie/import: invalid format throws invalidFileContent", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: VHSX",
    "Stars: Keanu Reeves",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: empty stars throws invalidFileContent", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: DVD",
    "Stars:   ",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: actor contains invalid characters throws invalidFileContent", async () => {
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: DVD",
    "Stars: Keanu Reeves, Robert'); DROP TABLE users;--",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: actor name too long throws invalidFileContent", async () => {
  const longName = "A".repeat(256);
  const content = [
    "Title: The Matrix",
    "Release Year: 1999",
    "Format: DVD",
    `Stars: ${longName}`,
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: empty title throws invalidFileContent", async () => {
  const content = [
    "Title:   ",
    "Release Year: 1999",
    "Format: DVD",
    "Stars: Keanu Reeves",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

test("movie/import: title too long throws invalidFileContent", async () => {
  const longTitle = "T".repeat(256);
  const content = [
    `Title: ${longTitle}`,
    "Release Year: 1999",
    "Format: DVD",
    "Stars: Keanu Reeves",
    "",
  ].join("\n");

  await assert.rejects(
    () => MovieImportAbl.import({ file: { buffer: Buffer.from(content, "utf-8") } }),
    (err) => {
      assert.equal(err.code, "invalidFileContent");
      return true;
    }
  );
});

