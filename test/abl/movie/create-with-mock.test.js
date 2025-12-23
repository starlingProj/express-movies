require("../../helpers/test-db");

const test = require("node:test");
const assert = require("node:assert/strict");

const { createMovieAbls } = require("../../../app/abl/movie");

/**
 * Example test demonstrating how to use factory functions for dependency injection.
 * This allows testing ABL classes with mocked dependencies.
 */
test("movie/create: using factory with mocked DAO", async () => {
  // Create a mock DAO
  const mockMovieDao = {
    create: async (dtoIn) => {
      // Simulate database operation
      return {
        id: 999,
        title: dtoIn.title,
        year: dtoIn.year,
        format: dtoIn.format,
        actors: dtoIn.actors.map(name => ({ id: 1, name }))
      };
    },
    listByTitleYearAndFormat: async (title, year, format) => {
      // Simulate no duplicates found
      return null;
    }
  };

  // Use factory to create ABL instance with mocked DAO
  const { CreateAbl } = createMovieAbls({ movieDao: mockMovieDao });

  const res = await CreateAbl.create({
    title: "Mocked Movie",
    year: 2024,
    format: "DVD",
    actors: ["Actor 1", "Actor 2"],
  });

  assert.equal(res.status, 1);
  assert.equal(res.data?.id, 999);
  assert.equal(res.data?.title, "Mocked Movie");
});

