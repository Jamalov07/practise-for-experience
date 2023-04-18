const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const { User } = require("./UserModel");
const { Product } = require("./productModel");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  customer: { type: DataTypes.INTEGER },
  products: { type: DataTypes.ARRAY(DataTypes.INTEGER) },
  orderDate: { type: DataTypes.DATE, defaultValue: new Date() },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
});

Order.belongsTo(User, { as: "orderCustomer", foreignKey: "customerId" });


module.exports = {
  Order,
};
