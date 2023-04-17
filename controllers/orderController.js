const mongoose = require("mongoose");
const { Order } = require("../models/orderSchema");
const ApiError = require("../errors/ApiError");
const MailerService = require("../services/MailerService");
const { User } = require("../models/userSchema");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");

const getOrders = async (req, res) => {
  try {
    const cashedOrders = await client.get("orders");
    if (cashedOrders) {
      return res.ok(200, JSON.parse(cashedOrders));
    }
    const orders = await Order.find({});
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Order id" });
    }
    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order  not found" });
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
    const { customer, products, status, orderDate } = req.body;
    const newOrder = await Order.create({
      customer,
      products,
      status,
      orderDate,
    });
    await client.del("orders");
    const user = await User.findOne({ _id: customer });
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
    console.log(req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Order id" });
    }
    const order = await Order.findOne({ _id: req.params.id });
    console.log(order);
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }

    const { customer, products, orderDate, status } = req.body;
    let newCustomer = customer || order.customer;
    let newProducts = products || order.products;
    let newOrderDate = orderDate || order.orderDate;
    let newStatus = status || order.status;
    if (status && order.status !== status) {
      console.log(customer, "buuuu");
      const user = await User.findOne({ _id: newCustomer });
      if (user) {
        await MailerService.newOrderMessage(
          user.email,
          `Orderingizning holati ${status}ga yangilandi`
        );
      }
    }
    await Order.updateOne(
      { _id: req.params.id },
      {
        customer: newCustomer,
        products: newProducts,
        orderDate: newOrderDate,
        status: newStatus,
      },
      { new: true }
    );
    await client.del("orders");
    const updatedOrder = await Order.findOne({ _id: order.id });
    res.ok(200, { order: updatedOrder, friendlyMsg: "Order updated" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Order id" });
    }
    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }

    await Order.deleteOne({ _id: req.params.id });
    await client.del("orders");
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
    const orders = await Order.find(options);
    console.log(orders);
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
    const orders = await Order.find().skip(skip).limit(limit);
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
    console.log(cart)
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
