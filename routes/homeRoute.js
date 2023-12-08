const express = require("express");
const routes = express.Router();
const homeController = require("../controllers/homeController");

routes.get("/home", homeController.renderIndex);
routes.get("/", homeController.renderHome);
routes.get("/checkout", homeController.renderCheckout);

module.exports = routes;
