const express = require("express");
const routes = express.Router();
const authController = require("../controllers/authController");

routes.get("/login", authController.renderLogin);
routes.post("/register", authController.handleRegister);
routes.get("/active/:token", authController.handleActive);
routes.get("/change_password/:id", authController.renderChangePassword);
routes.post("/change_password", authController.handleChangePassword);

module.exports = routes;
