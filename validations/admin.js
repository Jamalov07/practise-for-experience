const Joi = require("joi");

const adminSchema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(5).required(),
  email: Joi.string().email(),
  is_active: Joi.boolean().default(true),
  is_creator: Joi.boolean().default(false),
});

module.exports = adminSchema;
