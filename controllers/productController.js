const mongoose = require("mongoose");
const { Product } = require("../models/productSchema");
const ApiError = require("../errors/ApiError");
const fs = require("fs");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    console.log(products);
    res.ok(200, products);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Product id" });
    }
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product  not found" });
    }
    res.ok(200, product);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!req.file) {
      return res.error(400, { friendlyMsg: "File is required" });
    }
    const newProduct = await Product.create({
      name,
      description,
      price,
      image: req.file.filename,
      createdBy: req.admin.id,
    });

    res.ok(200, { product: newProduct });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Product id" });
    }
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product not found" });
    }

    const { name, description, price } = req.body;
    let newName = name || product.name;
    let newDescription = description || product.description;
    let newPrice = price || product.price;
    let image = product.image;
    if (req.file) {
      if (fs.existsSync(`./public/images/${product.image}`)) {
        fs.unlinkSync(`./public/images/${product.image}`);
      }
      image = req.file.filename;
    }
    await Product.updateOne(
      { _id: req.params.id },
      {
        name: newName,
        description: newDescription,
        price: newPrice,
        image: image,
      },
      { new: true }
    );
    res.ok(200, { product: product, friendlyMsg: "Product updated" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Product id" });
    }
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product not found" });
    }

    if (fs.existsSync(`./public/images/${product.image}`)) {
      fs.unlinkSync(`./public/images/${product.image}`);
    }
    await Product.deleteOne({ _id: req.params.id });
    res.ok(200, { friendlyMsg: "Product deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  deleteProduct,
};
