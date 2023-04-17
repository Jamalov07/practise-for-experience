const mongoose = require("mongoose");
// const { User } = require("../models/userSchema");

const ApiError = require("../errors/ApiError");
const bcrypt = require("bcryptjs");
const Jwt = require("../services/JwtService");
const config = require("config");
const { validationResult } = require("express-validator");
const { client } = require("../services/RedisService");
const { User } = require("../models/UserModel");

const getUsers = async (req, res) => {
  try {
    const cashedUsers = await client.get("users");
    if (cashedUsers) {
      return res.ok(200, JSON.parse(cashedUsers));
    }

    const users = await User.findAll();
    await client.set("users", JSON.stringify(users));
    console.log(users);
    res.ok(200, users);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const getUser = async (req, res) => {
  try {
    // if (!mongoose.isValidObjectId(req.params.id)) {
    //   return res.error(400, { friendlyMsg: "invalid User id" });
    // }
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.error(400, { friendlyMsg: "User  not found" });
    }
    res.ok(200, user);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const addUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    const { full_name, phone_number, email, username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 7);

    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone_number,
      username,
    });

    await client.del("users");

    const payload = {
      sub: newUser.id,
      is_active: newUser.is_active,
    };
    const tokens = Jwt.generateTokens(payload);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.ok(200, { ...tokens, user: newUser });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const editUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    // if (!mongoose.isValidObjectId(req.params.id)) {
    //   return res.error(400, { friendlyMsg: "invalid User id" });
    // }
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.error(400, { friendlyMsg: "User not found" });
    }

    const { full_name, email, phone_number, username, password } = req.body;
    let newFullName = full_name || user.full_name;
    let newPhoneNumber = phone_number || user.phone_number;
    let newUsername = username || user.username;
    let newEmail = email || user.email;
    let newPassword = user.password;
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 7);
      newPassword = hashedPassword;
    }
    await User.update(
      { _id: req.params.id },
      {
        full_name: newFullName,
        email: newEmail,
        phone_number: newPhoneNumber,
        username: newUsername,
        password: newPassword,
      }
    );
    await client.del("users");

    const updatedUser = await User.findOne({ where: { id: user.id } });
    res.ok(200, { user: updatedUser, friendlyMsg: "User updated" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // if (!mongoose.isValidObjectId(req.params.id)) {
    //   return res.error(400, { friendlyMsg: "invalid User id" });
    // }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.error(400, { friendlyMsg: "User not found" });
    }
    await User.deleteOne({ _id: req.params.id });
    await client.del("users");

    res.ok(200, { friendlyMsg: "User deleted" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Serverda hatolik",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, { friendlyMsg: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.error(400, {
        friendlyMsg: "User not found brat biz sizni tanimadik",
      });
    }
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.error(400, { friendlyMsg: "biz sizni topolmadik" });
    }
    const payload = {
      sub: user.id,
      is_active: user.is_active,
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
  getUsers,
  getUser,
  addUser,
  editUser,
  deleteUser,
  loginUser,
};
