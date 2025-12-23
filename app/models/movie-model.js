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
  },
  searchTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'search_title'
  }
}, {
  sequelize,
  modelName: "movie",
  tableName: "movies",
  underscored: false,
  defaultScope: {
    attributes: { exclude: ['searchTitle'] }
  },
  indexes: [
    {
      fields: ['title'],
      name: 'idx_movies_title'
    },
    {
      fields: ['year'],
      name: 'idx_movies_year'
    },
    {
      fields: ['search_title'],
      name: 'idx_movies_search_title'
    },
    {
      fields: ['title', 'year', 'format'],
      name: 'idx_movies_title_year_format'
    }
  ]
});

module.exports = MovieModel;