const express = require("express");

const Admin = require("../controllers/adminController");
const Validator = require("../middlewares/validator");
const {
  adminAdd,
  adminLogin,
  adminEdit,
} = require("../middlewares/expressValidator");

const router = express.Router();

router.get("/", Admin.getAdmins);
router.get("/:id", Admin.getAdminById);
router.post("/login", ...adminLogin, Admin.loginAdmin);
router.post("/", ...adminAdd, Validator("admin"), Admin.addAdmin);
router.patch("/:id", ...adminEdit, Admin.editAdmin);
router.delete("/:id", Admin.deleteAdmin);
module.exports = router;
