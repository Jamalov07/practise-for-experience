const redis = require("redis");
let client = redis.createClient();
(async function () {
  client.on("error", (err) => {
    console.log(`Redis client error: ${err}`);
  });

  await client.connect();
  console.log("Redis connected");
})();

module.exports = {
  client,
};
