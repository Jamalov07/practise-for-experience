const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  phone_number: { type: DataTypes.STRING, unique: true },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
});

