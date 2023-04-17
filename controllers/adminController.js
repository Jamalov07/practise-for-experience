const { default: mongoose } = require("mongoose");
const ApiError = require("../errors/ApiError");
const bcrypt = require("bcryptjs");
const MailerService = require("../services/MailerService");
const Jwt = require("../services/JwtService");
const config = require("config");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");
const { Admin } = require("../models/adminModel");

const getAdmins = async (req, res) => {
  try {
    const cashedAdmins = await client.get("admins");
    if (cashedAdmins) {
      return res.ok(200, JSON.parse(cashedAdmins));
    }
    const admins = await Admin.findAll();
    console.log(admins);
    await client.set("admins", JSON.stringify(admins));
    res.ok(200, admins);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
    });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findOne({ where: { id: req.params.id } });
    if (!admin) {
      return res.error(400, { friendlyMsg: "Admin  not found" });
    }
    res.ok(200, admin);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const addAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 7);
    const admins = await Admin.findAll();
    let creator = false;
    if (!admins.length) {
      creator = true;
    } else {
      creator = false;
    }
    const newAdmin = await Admin.create({
      ...req.body,
      password: hashedPassword,
      is_creator: creator,
    });
    await client.del("admins");
    await MailerService.sendMessage(
      newAdmin.email,
      `Assalomu alaykum hurmatli ${newAdmin.username}! Admin bo'lganingiz bilan tabriklaymiz!`
    );

    res.ok(200, { admin: newAdmin });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const editAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }

    const admin = await Admin.findOne({ where: { id: req.params.id } });
    if (!admin) {
      return res.error(400, { friendlyMsg: "Admin not found" });
    }
    let newPassword = admin.password;
    if (req.body.password) {
      const hashedPassword = bcrypt.hashSync(req.body.password, 7);
      newPassword = hashedPassword;
    }
    await admin.update({
      ...req.body,
      password: newPassword,
    });
    await client.del("admins");
    res.ok(200, { admin: admin, message: "Admin updated" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ where: { id: req.params.id } });
    if (!admin) {
      return res.error(400, { friendlyMsg: "Admin not found" });
    }
    await Admin.destroy({ where: { id: req.params.id } });
    await client.del("admins");
    res.ok(200, { admin: admin, friendlyMsg: "Admin deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email: email } });
    if (!admin) {
      return res.error(400, {
        friendlyMsg: "Admin not found brat biz sizni tanimadik",
      });
    }
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.error(400, { friendlyMsg: "biz sizni topolmadik" });
    }

    const payload = {
      id: admin.id,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
    };
    const tokens = Jwt.generateTokens(payload);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.ok(200, tokens);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

module.exports = {
  getAdmins,
  getAdminById,
  addAdmin,
  editAdmin,
  deleteAdmin,
  loginAdmin,
};
