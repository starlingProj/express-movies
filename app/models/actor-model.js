const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class ActorModel extends Model {
}

ActorModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  searchName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'search_name'
  }
}, {
  sequelize,
  modelName: "actor",
  tableName: "actors",
  underscored: false,
  defaultScope: {
    attributes: { exclude: ['searchName'] }
  },
  indexes: [
    {
      fields: ['name'],
      name: 'idx_actors_name'
    },
    {
      fields: ['search_name'],
      name: 'idx_actors_search_name'
    }
  ]
});

module.exports = ActorModel;