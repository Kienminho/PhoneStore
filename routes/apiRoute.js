const express = require("express");
const routes = express.Router();
const apiController = require("../controllers/apiController");

routes.get("/products/get-all-products", apiController.getAllProducts);
routes.post(
  "/products/add-product",
  apiController.upload.single("productImage"),
  apiController.addProduct
);

module.exports = routes;
