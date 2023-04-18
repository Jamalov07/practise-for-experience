const ApiError = require("../errors/ApiError");
const MailerService = require("../services/MailerService");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");
const { Order } = require("../models/orderModel");
const { User } = require("../models/UserModel");
const { Product } = require("../models/productModel");

const getOrders = async (req, res) => {
  try {
    const cashedOrders = await client.get("orders");
    if (cashedOrders) {
      return res.ok(200, JSON.parse(cashedOrders));
    }
    const orders = await Order.findAll();
    client.set("orders", JSON.stringify(orders));
    console.log(orders);
    res.ok(200, orders);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id } });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }
    res.ok(200, order);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const addOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    let msg = await checkProducts(res, req.body.products);
    if (msg) {
      return res.error(400, { friendlyMsg: "Product not found" });
    }
    const newOrder = await Order.create(req.body);
    await client.del("orders");
    await client.del("productids");

    const user = await User.findOne({ where: { id: req.body.customer } });
    if (user) {
      await MailerService.newOrderMessage(
        user.email,
        `Buyurtma muvaffaqiyatli qo'shildi`
      );
    }

    res.ok(200, { order: newOrder });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const editOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    const order = await Order.findOne({ where: { id: req.params.id } });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }
    if (req.body.products) {
      let msg = await checkProducts(res, req.body.products);
      if (msg) {
        return res.error(400, { friendlyMsg: "Product not found" });
      }
    }
    let newCustomer = req.body.customer || order.customer;
    if (req.body.status && order.status !== req.body.status) {
      const user = await User.findOne({ where: { id: newCustomer } });
      if (user) {
        await MailerService.newOrderMessage(
          user.email,
          `Orderingizning holati ${req.body.status}ga yangilandi`
        );
      }
    }
    await order.update(req.body);
    await client.del("orders");
    res.ok(200, { order: order, friendlyMsg: "Order updated" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id } });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }

    await Order.destroy({ where: { id: req.params.id } });
    await client.del("orders");
    await client.del("productids");
    res.ok(200, { friendlyMsg: "Order deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const filterOrder = async (req, res) => {
  try {
    const { status, customer, products, orderDate } = req.query;
    let options = {};

    if (status) {
      options.status = status;
    }
    if (customer) {
      options.customer = customer;
    }
    if (orderDate) {
      options.orderDate = orderDate;
    }
    if (products) {
      options.products = products.split(",");
    }
    const orders = await Order.findAll({ where: options });
    res.ok(200, orders);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const paginateOrder = async (req, res) => {
  try {
    const page = req.params.page;
    const limit = 10;
    const skip = (+page - 1) * limit;
    const orders = await Order.findAll({ offset: skip, limit: limit });
    res.ok(200, orders);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const newOrderWithCookie = async (req, res) => {
  try {
    const cart = req.cookies.cart;
    if (!cart) {
      return res.error(400, { friendlyMsg: "products not added for order" });
    }
    console.log(cart);
    const newOrder = await Order.create({
      products: cart,
      customer: req.body.customer,
    });
    return res.ok(200, { order: newOrder });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const checkProducts = async (res, prodIds) => {
  let productIds;
  let products;
  let cashedproductid = await client.get("productids");
  if (cashedproductid) {
    productIds = JSON.parse(cashedproductid);
  } else {
    products = await Product.findAll();
    await client.set("products", JSON.stringify(products));
    productIds = [];
    products.forEach((product) => {
      productIds.push(product.id);
    });
    await client.set("productids", JSON.stringify(productIds));
  }
  for (let i = 0; i < prodIds.length; i++) {
    if (!productIds.includes(prodIds[i])) {
      return true;
    }
  }
  return false;
};

module.exports = {
  getOrders,
  getOrder,
  addOrder,
  editOrder,
  deleteOrder,
  filterOrder,
  paginateOrder,
  newOrderWithCookie,
};
