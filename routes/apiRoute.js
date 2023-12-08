const express = require("express");
const routes = express.Router();
const apiController = require("../controllers/apiController");

routes.get("/products/get-all-products", apiController.getAllProducts);
routes.post(
	"/products/add-product",
	apiController.upload.single("productImage"),
	apiController.addProduct
);

routes.post("/customer/get-profile", apiController.getCustomerProfile);
routes.post("/customer/add-new-profile", apiController.addNewCustomerProfile);
routes.post(
	"/customer/get-purchase-history",
	apiController.getCustomerPurchaseHistory
);
routes.post(
	"/customer/get-invoice-detail",
	apiController.getCustomerInvoiceDetail
);

module.exports = routes;
