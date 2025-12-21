const MovieModel = require('../movie-model');
const ActorModel = require('../actor-model');

MovieModel.belongsToMany(ActorModel, {
  through: 'movie_actors',
  foreignKey: 'movieId',
  otherKey: 'actorId',
  as: 'actors',
  onDelete: "CASCADE"
});

ActorModel.belongsToMany(MovieModel, {
  through: 'movie_actors',
  foreignKey: 'actorId',
  otherKey: 'movieId',
  as: 'movies'
});