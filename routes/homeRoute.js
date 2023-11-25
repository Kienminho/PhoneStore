const express = require("express");
const routes = express.Router();
const homeController = require("../controllers/homeController");

routes.get("/", homeController.renderHome);

module.exports = routes;
