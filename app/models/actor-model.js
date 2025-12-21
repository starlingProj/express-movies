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
  }
}, {
  sequelize,
  modelName: "actor",
  tableName: "actors",
  underscored: false,
  indexes: [
    {
      fields: ['name'],
      name: 'idx_actors_name'
    }
  ]
});

module.exports = ActorModel;