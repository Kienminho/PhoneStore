const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser");
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "my-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 24 * 1000,
    },
  })
);
app.use(cookieParser());

const port = process.env.PORT;

//api routes
const apiRoute = require("./routes/apiRoute");
app.use("/api/", apiRoute);
//list routes
const authRoute = require("./routes/authRoute");
const homeRoute = require("./routes/homeRoute");
const adminRoute = require("./routes/adminRoute");
app.use("/", homeRoute);
app.use("/auth", authRoute);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
