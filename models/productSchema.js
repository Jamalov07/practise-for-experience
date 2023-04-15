const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    image: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = {
  Product,
};
