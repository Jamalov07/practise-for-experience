const express = require("express");

const Product = require("../controllers/productController");
const Validator = require("../middlewares/validator");
const upload = require("../services/FileService");
const AdminMiddleware = require("../middlewares/adminMiddleware");
const { Admin } = require("../models/adminSchema");
const router = express.Router();

router.get("/", Product.getProducts);
router.get("/:id", Product.getProduct);
router.post(
  "/",
  AdminMiddleware,
  upload.single("image"),
  Validator("product"),
  Product.addProduct
);
router.patch(
  "/:id",
  AdminMiddleware,
  upload.single("image"),
  Product.editProduct
);
router.delete("/:id", Product.deleteProduct);
module.exports = router;
