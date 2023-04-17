const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  customer: { type: DataTypes.INTEGER },
  products: { type: DataTypes.ARRAY },
  orderDate: { type: DataTypes.DATE, defaultValue: new Date() },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
});

module.exports = {
  Order,
};
