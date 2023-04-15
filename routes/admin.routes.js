const express = require("express");

const Admin = require("../controllers/adminController");
const Validator = require("../middlewares/validator");

const router = express.Router();

router.get("/", Admin.getAdmins);
router.get("/:id", Admin.getAdminById);
router.post("/login", Admin.loginAdmin);
router.post("/", Validator("admin"), Admin.addAdmin);
router.patch("/:id", Admin.editAdmin);
router.delete("/:id", Admin.deleteAdmin);
module.exports = router;
