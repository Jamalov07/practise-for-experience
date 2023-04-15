const express = require("express");
const router = express.Router();
const AdminRoutes = require("./admin.routes");
const response = require("./response.routes");
const UserRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");

router.use(response);
router.use("/admin", AdminRoutes);
router.use("/user", UserRoutes);
router.use("/product", productRoutes);
router.use("/order", orderRoutes);
module.exports = router;
