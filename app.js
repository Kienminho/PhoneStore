const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("handlebars");
require("dotenv").config();
const app = express();

//middleware
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT;

//list routes
const authRoute = require("./routes/authRoute");
app.use("/auth", authRoute);

app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
