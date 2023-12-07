const express = require("express");
const routes = express.Router();
const homeController = require("../controllers/homeController");

routes.get("/", homeController.renderHome);
routes.get("/home", homeController.renderIndex);

module.exports = routes;
