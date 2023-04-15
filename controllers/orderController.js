const mongoose = require("mongoose");
const { Order } = require("../models/orderSchema");
const ApiError = require("../errors/ApiError");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
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
    const { customer, products, status, orderDate } = req.body;
    const newOrder = await Order.create({
      customer,
      products,
      status,
      orderDate,
    });
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
    console.log(req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Order id" });
    }
    const order = await Order.findOne({ _id: req.params.id });
    console.log(order);
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }

    const { customer, products, orderDate } = req.body;
    let newCustomer = customer || order.customer;
    let newProducts = products || order.products;
    let newOrderDate = orderDate || order.orderDate;

    await Order.updateOne(
      { _id: req.params.id },
      {
        customer: newCustomer,
        products: newProducts,
        orderDate: newOrderDate,
      },
      { new: true }
    );
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Order id" });
    }
    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.error(400, { friendlyMsg: "Order not found" });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.ok(200, { friendlyMsg: "Order deleted" });
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
};
