const mongoose = require("mongoose");
const config = require("config");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const PORT = config.get("port");
const routes = require("./routes/index.routes");
const errorHandler = require("./middlewares/errorHandling");
const { errLogger, winstonLogger } = require("./middlewares/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { client } = require("./services/RedisService");
const path = require("path");
const stripe = require("stripe")(config.get("stripe_secret_key"));
const sequelize = require("./config/db");

app.use(winstonLogger);
app.use(express.json());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static(path.join(__dirname, "./views")));
app.use(cookieParser());
app.use(routes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errLogger);
app.use(errorHandler);

app.post("/charge", (req, res) => {
  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken,
      })
      .then((customer) =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id,
        })
      )
      .then(() => res.render("completed.html"))
      .catch((err) => console.log(err));
  } catch (err) {
    res.send(err);
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection has been established successfully");
    // await mongoose.connect(config.get("dbAdr"));
    console.log(await client.get("ping"));
    app.listen(PORT, () => {
      console.log(`Server ${PORT} - portda ishga tushdi`);
    });
  } catch (error) {
    console.log(`Serverda hatolik yuzaga keldi. Hatolik : ${error.message}`);
  }
}

start();

module.exports = app;
