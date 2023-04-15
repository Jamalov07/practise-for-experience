const express = require("express");

const Order = require("../controllers/orderController");
const Validator = require("../middlewares/validator");
const UserMiddleware = require("../middlewares/userMiddleware");
const router = express.Router();

router.get("/", Order.getOrders);
router.get("/:id", Order.getOrder);
router.post("/", UserMiddleware, Validator("order"), Order.addOrder);
router.patch("/:id", UserMiddleware, Order.editOrder);
router.delete("/:id", Order.deleteOrder);

module.exports = router;
