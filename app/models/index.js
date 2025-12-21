const sequelize = require('../config/database');

const MovieModel = require('./movie-model');
const ActorModel = require('./actor-model');
const UserModel = require('./user-model');

require('./associations');

module.exports = {
  sequelize,
  MovieModel,
  ActorModel,
  UserModel
};