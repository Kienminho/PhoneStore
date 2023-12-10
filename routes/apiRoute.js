const express = require("express");
const routes = express.Router();
const apiController = require("../controllers/apiController");

//product
routes.get("/products/get-all-products", apiController.getAllProducts);
routes.post(
	"/products/add-product",
	apiController.upload.single("productImage"),
	apiController.addProduct
);

//customer
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
routes.delete("/products/delete/:id", apiController.deleteProduct);
routes.put(
	"/products/update-product",
	apiController.upload.single("productImageUpdate"),
	apiController.updateProduct
);
routes.get(
	"/products/get-product-by-barcode/:barcode",
	apiController.getProductByBarcode
);
routes.post(
	"/invoices",
	apiController.createInvoice,
	apiController.generateInvoicePdf
);

// user
routes.get("/users/get-all-user", apiController.getAllUser);
routes.delete("/users/delete/:id", apiController.deleteUser);
routes.post("/users/reactive", apiController.reactivateAccount);
routes.post(
	"/users/uploadAvatar",
	apiController.upload.single("avatar"),
	apiController.uploadAvatar
);

// get info mine
routes.get("/users/info-mine", apiController.getInfoMine);
routes.post("/users/change-password", apiController.changePassword);

module.exports = routes;
