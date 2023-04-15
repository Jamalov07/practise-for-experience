const { default: mongoose } = require("mongoose");
const ApiError = require("../errors/ApiError");
const { Admin } = require("../models/adminSchema");
const bcrypt = require("bcryptjs");
const MailerService = require("../services/MailerService");
const Jwt = require("../services/JwtService");
const config = require("config");

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    console.log(admins);
    res.ok(200, admins);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
    });
  }
};

const getAdminById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid admin id" });
    }
    const admin = await Admin.findOne({ _id: req.params.id });
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
    const { username, password, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 7);

    const admins = await Admin.find();
    let creator = false;
    if (!admins.length) {
      creator = true;
    } else {
      creator = false;
    }

    const newAdmin = await Admin.create({
      username: username,
      email: email,
      password: hashedPassword,
      is_creator: creator,
    });

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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Admin id" });
    }
    const admin = await Admin.findOne({ _id: req.params.id });
    if (!admin) {
      return res.error(400, { friendlyMsg: "Admin not found" });
    }
    const { username, email, password } = req.body;
    let newUsername = username || admin.username;
    let newEmail = email || admin.email;
    let newPassword = admin.password;
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 7);
      newPassword = hashedPassword;
    }
    await Admin.updateOne(
      { _id: req.params.id },
      {
        username: newUsername,
        email: newEmail,
        admin_password: newPassword,
      },
      { new: true }
    );
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.error(400, { friendlyMsg: "invalid Admin id" });
    }
    const admin = await Admin.findOne({ _id: req.params.id });
    if (!admin) {
      return res.error(400, { friendlyMsg: "Admin not found" });
    }
    await Admin.deleteOne({ _id: req.params.id });
    res.error(400, { admin: admin, friendlyMsg: "Admin deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email });

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
