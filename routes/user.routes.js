const express = require("express");

const User = require("../controllers/userController");
const Validator = require("../middlewares/validator");

const router = express.Router();

router.get("/", User.getUsers);
router.get("/:id", User.getUser);
router.post("/login", User.loginUser);
router.post("/", Validator("user"), User.addUser);
router.patch("/:id", User.editUser);
router.delete("/:id", User.deleteUser);
module.exports = router;
