const Joi = require("joi");

const orderSchema = Joi.object({
  customer: Joi.string().required(),
  products: Joi.array().items(Joi.string()).required(),
  orderDate: Joi.date().default(Date.now),
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered")
    .default("pending"),
});

module.exports = orderSchema;
