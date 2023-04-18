const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required(),
  image: Joi.string(),
  createdBy: Joi.number(),
});

module.exports = productSchema;
