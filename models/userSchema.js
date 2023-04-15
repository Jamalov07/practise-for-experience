const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = { User };
