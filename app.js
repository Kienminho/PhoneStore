const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const helpers = require("./common/helper");
require("dotenv").config();
const app = express();

//middleware
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: false,
    helpers: {
      isSuccessEq3: helpers.isSuccessEq3,
    },
  })
);
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT;

//list routes
const authRoute = require("./routes/authRoute");
const homeRoute = require("./routes/homeRoute");
app.use("/", homeRoute);
app.use("/auth", authRoute);

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
