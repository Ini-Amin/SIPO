const express = require("express");
const cors = require("cors");

const indexRouter = require("./routes/index");
const productRouter = require("./routes/productRoutes");
const {
  notFoundMiddleware,
  errorMiddleware,
} = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/api/products", productRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
