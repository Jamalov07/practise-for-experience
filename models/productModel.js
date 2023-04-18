const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const { Admin } = require("./adminModel");

const Product = sequelize.define("product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  name: { type: DataTypes.STRING },
  price: { type: DataTypes.INTEGER },
  description: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  createdBy: { type: DataTypes.INTEGER },
});

Product.belongsTo(Admin, { as: "admin" });

module.exports = {
  Product,
};
