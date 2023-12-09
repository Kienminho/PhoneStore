const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

routes.get(
  "/product-manager",
  authController.checkLoggedIn,
  adminController.renderProductManager
);
routes.get(
  "/employee-manager",
  authController.checkLoggedIn,
  adminController.renderEmployeeManager
);

module.exports = routes;
