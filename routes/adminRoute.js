const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/adminController");

routes.get("/product-manager", adminController.renderProductManager);

module.exports = routes;
