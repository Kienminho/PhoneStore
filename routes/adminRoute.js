const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/adminController");

routes.get("/product-manager", adminController.renderProductManager);
routes.get("/employee-manager", adminController.renderEmployeeManager);

module.exports = routes;
