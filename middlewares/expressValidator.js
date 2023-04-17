const { body } = require("express-validator");

const adminAdd = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username is string")
    .isLength({ min: 6 }),
  body("password").notEmpty().isLength({ min: 6 }),
];

const adminLogin = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").notEmpty().isLength({ min: 6 }),
];

const adminEdit = [
  body("email").optional().isEmail(),
  body("username").optional().isLength({ min: 6 }),
  body("password").optional().isLength({ min: 6 }),
];

const userAdd = [
  body("full_name").notEmpty().isLength({ min: 6 }),
  body("phone_number").notEmpty().isLength({ min: 10 }),
  body("username").notEmpty().isLength({ min: 6 }),
  body("password").notEmpty().isLength({ min: 6 }),
  body("email").notEmpty().isEmail(),
];

const userLogin = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").notEmpty().isLength({ min: 6 }),
];

const userEdit = [
  body("full_name").optional().isLength({ min: 6 }),
  body("phone_number").optional().isLength({ min: 10 }),
  body("username").optional().isLength({ min: 10 }),
  body("password").optional().isLength({ min: 10 }),
  body("email").optional().isEmail(),
];

const productAdd = [
  body("name").notEmpty(),
  body("price").notEmpty().isNumeric(),
  body("description").optional(),
  body("createdBy"),
];

const productEdit = [
  body("name").optional(),
  body("price").optional().isNumeric(),
  body("description").optional(),
  body("createdBy").optional(),
];

const orderAdd = [
  body("customer").notEmpty(),
  body("products").notEmpty().isArray(),
  body("orderDate").optional(),
  body("status").notEmpty().isString(),
];

const orderEdit = [
  body("customer").optional(),
  body("products").optional().isArray(),
  body("orderDate").optional().isDate(),
  body("status").optional().isString(),
];

module.exports = {
  adminAdd,
  adminEdit,
  adminLogin,
  userAdd,
  userEdit,
  userLogin,
  productAdd,
  productEdit,
  orderAdd,
  orderEdit,
};
