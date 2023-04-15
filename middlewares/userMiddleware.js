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
    req.user = decodedData;
    req.body.customer = decodedData.sub;
    if (!decodedData.is_active) {
      return res.error(400, { message: "activmas" });
    }
    if (!decodedData.sub) {
      return res.error(400, { message: "userlar uchun" });
    }
    next();
  } catch (error) {
    res.error(400, { message: error.message });
  }
};
