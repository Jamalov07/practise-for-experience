const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  phone_number: { type: DataTypes.STRING },
  full_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN,defaultValue:true },
});

module.exports = {
  User,
};
