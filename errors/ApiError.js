class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
  static badRequest(res, error) {
    return res.error(400, {
      message: error.message,
      friendlyMsg: error.friendlyMsg,
    });
  }
  static unauthorized(res, error) {
    return res.error(401, {
      message: error.message,
      friendlyMsg: error.friendlyMsg,
    });
  }
  static forbidden(res, error) {
    return res.error(403, {
      message: error.message,
      friendlyMsg: error.friendlyMsg,
    });
  }
  static notFound(res, error) {
    return res.error(404, {
      message: error.message,
      friendlyMsg: error.friendlyMsg,
    });
  }
  static internal(res, error) {
    return res.error(500, {
      message: error.message,
      friendlyMsg: error.friendlyMsg,
    });
  }
}

module.exports = ApiError;
