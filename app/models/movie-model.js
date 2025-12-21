const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const MovieConstants = require("../constants/movie-constants");

class MovieModel extends Model {
}

MovieModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: MovieConstants.MIN_YEAR,
      max: MovieConstants.MAX_YEAR
    }
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [MovieConstants.VALID_FORMATS]
    },
  }
}, {
  sequelize,
  modelName: "movie",
  tableName: "movies",
  underscored: false,
  indexes: [
    {
      fields: ['title'],
      name: 'idx_movies_title'
    },
    {
      fields: ['year'],
      name: 'idx_movies_year'
    }
  ]
});

module.exports = MovieModel;