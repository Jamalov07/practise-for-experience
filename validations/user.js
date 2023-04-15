const Joi = require("joi");

const userSchema = Joi.object({
  full_name: Joi.string().required(),
  phone_number: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  is_active: Joi.boolean(),
});

module.exports = userSchema;
