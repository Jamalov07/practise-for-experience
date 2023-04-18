const ApiError = require("../errors/ApiError");
const fs = require("fs");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");
const { Product } = require("../models/productModel");

const getProducts = async (req, res) => {
  try {
    const cashedProducts = await client.get("products");
    if (cashedProducts) {
      return res.ok(200, JSON.parse(cashedProducts));
    }
    const products = await Product.findAll();
    await client.set("products", JSON.stringify(products));
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
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product not found" });
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
    const { name, description, price, createdBy } = req.body;
    // if (!req.file) {
    //   return res.error(400, { friendlyMsg: "File is required" });
    // }
    const newProduct = await Product.create({
      name,
      description,
      price,
      image: req?.file?.filename || "",
      createdBy: req?.admin?.id || createdBy,
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

    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product not found" });
    }

    let image = product.image;
    if (req.file) {
      if (fs.existsSync(`./public/images/${product.image}`)) {
        fs.unlinkSync(`./public/images/${product.image}`);
      }
      image = req.file.filename;
    }
    await product.update({
      ...req.body,
      image: image,
    });
    await client.del("products");

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
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.error(400, { friendlyMsg: "Product not found" });
    }

    if (fs.existsSync(`./public/images/${product.image}`)) {
      try {
        fs.unlinkSync(`./public/images/${product.image}`);
      } catch (error) {
        
      }
    }
    await Product.destroy({ where: { id: req.params.id } });
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
      options.price = +price;
    }

    if (createdBy) {
      options.createdBy = createdBy;
    }
    const products = await Product.findAll({ where: options });
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
    const products = await Product.findAll({ offset: skip, limit: limit });

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
