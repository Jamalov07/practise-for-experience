const express = require("express");
const router = express.Router();
const Response = require("../services/Response");
const lodash = require("lodash");

router.use((req, res, next) => {
  res.ok = (status, data, notification = {}) => {
    let showNull = req.query.showNull || false;
    removeNullableNestedObject(data, showNull, function (response) {
      let resp = new Response(status, response, null, notification);
      res.status(status);
      res.json(resp);
    });
  };

  res.error = (status, err, data = {}) => {
    console.log(status, err, data);
    if (typeof err == "object") {
      let response = new Response(status, data, err, {});
      response.getError((errorResp) => {
        res.status(status);
        res.json(errorResp);
        res.end();
      });
    }
  };
  next();
});
module.exports = router;

const traverse = require("traverse");
const mongoose = require("mongoose");

// const removeNullableNestedObject = function (params, showNull, callback) {
//   let prunedParams = traverse(params).map(function (value) {
//     if (
//       lodash.isUndefined(value) ||
//       lodash.isNull(value) ||
//       lodash.isNaN(value) ||
//       (lodash.isString(value) && lodash.isEmpty(value)) ||
//       (lodash.isObject(value) && lodash.isEmpty(value) && !lodash.isDate(value))
//     ) {
//       if (showNull) {
//         if (lodash.isNumber(value)) return 0;
//         if (lodash.isArray(value)) return [];
//         if (value instanceof mongoose.Types.ObjectId) return value; // check if value is a Mongoose ObjectID
//         return "";
//       }
//       // this.delete();
//     }
//   });
//   callback(prunedParams);
// };

const removeNullableNestedObject = function (params, showNull, callback) {
  try {
    params = pruneEmpty(params, showNull);
  } catch (ex) {
    console.log(ex);
    console.error("Error when remove nullable nested objects", ex);
  }
  callback(params);
};

function pruneEmpty(obj, showNull) {
  console.log(obj, showNull);
  return (function prune(current) {
    lodash.forOwn(current, function (value, key) {
      if (
        lodash.isUndefined(value) ||
        lodash.isNull(value) ||
        lodash.isNaN(value) ||
        (lodash.isString(value) && lodash.isEmpty(value)) ||
        (lodash.isObject(value) &&
          lodash.isEmpty(prune(value)) &&
          !lodash.isDate(value))
      ) {
        if (showNull) current[key] = "";
        if (showNull && lodash.isNumber(current[key]))
          return (current[key] = 0);
        if (showNull && lodash.isArray(value)) return (current[key] = []);
        delete current[key];
      }
    });
    if (lodash.isArray(current)) lodash.pull(current, undefined);

    return current;
  })(lodash.cloneDeep(obj));
}
