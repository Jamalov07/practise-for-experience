const Validators = require("../validations/index");

module.exports = function (validator) {
  if (!Validators.hasOwnProperty(validator)) {
    console.log(validator);
    throw new Error(`${validator} validator is not exists`);
  }
  return async function (req, res, next) {
    try {
      const validated = await Validators[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi) {
        return res.error(400, {
          message: error.message,
          friendlyMsg: "Validation error",
        });
      }
      return res.error(500, {
        friendlyMsg: "Internal error",
      });
    }
  };
};
