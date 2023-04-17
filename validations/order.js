const Joi = require("joi");

const orderSchema = Joi.object({
  customer: Joi.number().required(),
  products: Joi.array().items(Joi.number()).required(),
  orderDate: Joi.date().default(Date.now),
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered")
    .default("pending"),
});

module.exports = orderSchema;
