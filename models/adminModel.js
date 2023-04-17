const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Admin = sequelize.define("admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  is_active: { type: DataTypes.BOOLEAN },
  is_creator: { type: DataTypes.BOOLEAN },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
});

module.exports = {
  Admin,
};
