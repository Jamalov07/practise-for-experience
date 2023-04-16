const Jwt = require("../services/JwtService");
const config = require("config");

module.exports = async function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.error(400, { message: "imkonsizdaaa" });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return res.error(400, { message: "token yo'q" });
    }
    const decodedData = await Jwt.verifyAccess(token, config.get("secret"));
    if (!decodedData) {
      return res.error(400, { message: "invalid token" });
    }
    req.admin = decodedData;
    req.body.createdBy = decodedData.id
    if (decodedData.is_creator) {
      return next();
    }
    if (!decodedData.is_active) {
      return res.error(400, { message: "activmas" });
    }
    next();
  } catch (error) {
    res.error(400, { message: error.message });
  }
};
