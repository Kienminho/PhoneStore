const express = require("express");
const routes = express.Router();
const homeController = require("../controllers/homeController");
const authController = require("../controllers/authController");

routes.get("/home", authController.checkLoggedIn, homeController.renderIndex);
routes.get("/", authController.renderLogin);
routes.get(
  "/checkout",
  authController.checkLoggedIn,
  homeController.renderCheckout
);
routes.get(
  "/my-profile",
  authController.checkLoggedIn,
  homeController.renderInfo
);
routes.get(
  "/payment",
  authController.checkLoggedIn,
  homeController.renderPayment
);

routes.get("/pay-success/:id", homeController.successPayment);

module.exports = routes;
