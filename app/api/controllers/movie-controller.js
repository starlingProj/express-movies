const { CreateAbl, GetAbl, DeleteAbl, UpdateAbl, ListAbl, ImportAbl } = require('../../abl/movie');

/**
 * Controller for handling movie-related operations.
 */
class MovieController {
  static async create(req, res) {
    const result = await CreateAbl.create(req.validatedDtoIn);
    res.status(201).json(result);
  }

  static async get(req, res) {
    const result = await GetAbl.get(req.validatedDtoIn);
    res.status(200).json(result);
  }

  static async delete(req, res) {
    const result = await DeleteAbl.delete(req.validatedDtoIn);
    res.status(200).json(result);
  }

  static async update(req, res) {
    const result = await UpdateAbl.update(req.validatedDtoIn);
    res.status(200).json(result);
  }

  static async list(req, res) {
    const result = await ListAbl.list(req.validatedDtoIn);
    res.status(200).json(result);
  }

  static async import(req, res) {
    const result = await ImportAbl.import({ file: req.file });
    res.status(200).json(result);
  }

}

module.exports = MovieController;
