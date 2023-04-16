const express = require("express");

const Order = require("../controllers/orderController");
const Validator = require("../middlewares/validator");
const UserMiddleware = require("../middlewares/userMiddleware");
const { orderAdd, orderEdit } = require("../middlewares/expressValidator");
const router = express.Router();

router.get("/", Order.getOrders);
router.get("/filter", Order.filterOrder);
router.get("/page/:page", Order.paginateOrder);
router.get("/:id", Order.getOrder);
router.post(
  "/",
  UserMiddleware,
  ...orderAdd,
  Validator("order"),
  Order.addOrder
);
router.patch("/:id", ...orderEdit, UserMiddleware, Order.editOrder);
router.delete("/:id", Order.deleteOrder);

module.exports = router;
