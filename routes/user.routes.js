const express = require("express");

const User = require("../controllers/userController");
const Validator = require("../middlewares/validator");
const { userLogin, userAdd, userEdit } = require("../middlewares/expressValidator");

const router = express.Router();

router.get("/", User.getUsers);
router.get("/:id", User.getUser);
router.post("/login",...userLogin, User.loginUser);
router.post("/",...userAdd, Validator("user"), User.addUser);
router.patch("/:id",...userEdit, User.editUser);
router.delete("/:id", User.deleteUser);
module.exports = router;
