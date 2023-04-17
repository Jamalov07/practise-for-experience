const express = require("express");

const Product = require("../controllers/productController");
const Validator = require("../middlewares/validator");
const upload = require("../services/FileService");
const AdminMiddleware = require("../middlewares/adminMiddleware");
const { Admin } = require("../models/adminSchema");
const { productAdd, productEdit } = require("../middlewares/expressValidator");
const router = express.Router();

router.get("/", Product.getProducts);
router.get("/filter", Product.filterProduct);
router.get("/:id", Product.getProduct);
router.get("/page/:page", Product.paginateProduct);
router.post("/cart/:id", Product.addtoCookie);
router.post(
  "/",
  AdminMiddleware,
  upload.single("image"),
  Validator("product"),
  ...productAdd,
  Product.addProduct
);
router.patch(
  "/:id",
  AdminMiddleware,
  ...productEdit,
  upload.single("image"),
  Product.editProduct
);
router.delete("/:id", Product.deleteProduct);
module.exports = router;
