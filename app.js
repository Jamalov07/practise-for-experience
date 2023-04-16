const mongoose = require("mongoose");
const config = require("config");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = config.get("port");
const routes = require("./routes/index.routes");
const errorHandler = require("./middlewares/errorHandling");
const { errLogger, winstonLogger } = require("./middlewares/loggerMiddleware");

app.use(winstonLogger);
app.use(express.json());
app.use(cookieParser());
app.use(routes);
app.use(errLogger);
app.use(errorHandler);


async function start() {
  try {
    await mongoose.connect(config.get("dbAdr"));
    app.listen(PORT, () => {
      console.log(`Server ${PORT} - portda ishga tushdi`);
    });
  } catch (error) {
    console.log(`Serverda hatolik yuzaga keldi. Hatolik : ${error.message}`);
  }
}

start();
