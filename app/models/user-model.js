const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class UserModel extends Model {
}

UserModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: "user",
  tableName: "users",
  indexes: [
    {
      fields: ['email'],
      name: 'idx_users_email',
      unique: true
    }
  ]
});

module.exports = UserModel;

