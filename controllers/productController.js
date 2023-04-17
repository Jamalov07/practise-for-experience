const mongoose = require("mongoose");
const { Product } = require("../models/productSchema");
const ApiError = require("../errors/ApiError");
const fs = require("fs");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");

const getProducts = async (req, res) => {
  try {
    const cashedProducts = await client.get("products");
    if (cashedProducts) {
      return res.ok(200, JSON.parse(cashedProducts));
    }
    const products = await Product.find({});
    await client.set("products", JSON.stringify(products));
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
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
    await client.del("products");

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
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
    await client.del("products");

    const updatedProduct = await Product.findOne({ _id: product.id });
    res.ok(200, { product: updatedProduct, friendlyMsg: "Product updated" });
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
    await client.del("products");

    res.ok(200, { friendlyMsg: "Product deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const filterProduct = async (req, res) => {
  try {
    console.log(req.query);
    const { name, price, createdBy } = req.query;
    let options = {};
    if (name) {
      options.name = name;
    }
    if (price) {
      options.price = price;
    }

    if (createdBy) {
      options.createdBy = createdBy;
    }
    const products = await Product.find(options);
    res.ok(200, products);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const paginateProduct = async (req, res) => {
  try {
    const page = req.params.page;
    const limit = 10;
    const skip = (+page - 1) * limit;
    const products = await Product.find().skip(skip).limit(limit);
    res.ok(200, products);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const addtoCookie = async (req, res) => {
  try {
    let cart = req.cookies.cart;
    console.log(req.cookies);
    if (!cart) {
      cart = [req.params.id];
    } else {
      cart.push(req.params.id);
    }
    res.cookie("cart", cart);
    return res.ok(200, "ok");
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
  filterProduct,
  paginateProduct,
  addtoCookie,
};
