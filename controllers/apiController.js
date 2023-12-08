const multer = require("multer");

const Common = require("../common/Common");
const Model = require("../models/Products");
const { Customer } = require("../models/Customer");
const { Invoice, InvoiceItem } = require("../models/Invoice");

//setup folder save file
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Set the destination folder for uploaded files
		cb(null, "./public/images/");
	},
	filename: function (req, file, cb) {
		const nameProduct = req.body.productName;
		// Set the filename for uploaded files
		cb(null, `${nameProduct}_${Date.now()}.jpg`);
	},
});
const upload = multer({ storage: storage });

const getAllProducts = async (req, res) => {
	try {
		const listProducts = await Model.Products.find({});
		const categories = await Model.Category.find({});

		const productsWithCategoryNames = listProducts.map((product) => {
			const matchingCategory = categories.find(
				(category) => category._id.toString() === product.category.toString()
			);

			return {
				...product.toObject(),
				categoryName: matchingCategory ? matchingCategory.nameCategory : null,
			};
		});

		return res.json(
			Common.createSuccessResponseModel(
				productsWithCategoryNames.length,
				productsWithCategoryNames
			)
		);
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

const addProduct = async (req, res) => {
	const categories = await Model.Category.findOne({
		nameCategory: req.body.category,
	});
	console.log(categories);
	const newData = {
		barCode: generateSixDigitNumber(),
		name: req.body.productName,
		screenSize: req.body.size,
		ram: req.body.ram,
		rom: req.body.rom,
		importPrice: req.body.importPrice,
		priceSale: req.body.salePrice,
		description: req.body.description,
		imageLink: req.file.path.match(/public(.*)/)?.[1],
		saleNumber: 0,
		creationDate: new Date(),
		category: categories._id, // Replace with the actual category ObjectId
	};

	//save to db
	await Model.Products.create(newData)
		.then((createdProduct) => {
			res.json(Common.createSuccessResponseModel(1, createdProduct));
		})
		.catch((error) => {
			console.error("Error creating product:", error);
			res.json(
				Common.createResponseModel(
					404,
					"Error creating product",
					createdProduct
				)
			);
		});
};

// Module Customer
const getProductWithCategoryName = async () => {
	const listProducts = await Model.Products.find({});
	const categories = await Model.Category.find({});

	return listProducts.map((product) => {
		const matchingCategory = categories.find(
			(category) => category._id.toString() === product.category.toString()
		);

		return {
			...product.toObject(),
			categoryName: matchingCategory ? matchingCategory.nameCategory : null,
		};
	});
};

const getCustomerProfile = async (req, res) => {
	try {
		const customer = await Customer.findOne({
			phoneNumber: req.body.phoneNumber,
		});

		if (customer) {
			return res.json(
				Common.createSuccessResponseModel(1, customer.toObject())
			);
		} else {
			return res.json(
				Common.createResponseModel(404, "Không tìm thấy khách hàng")
			);
		}
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

const addNewCustomerProfile = async (req, res) => {
	try {
		const newCustomer = await Customer.create({
			phoneNumber: req.body.phoneNumber,
			fullName: req.body.fullName,
			address: req.body.address,
		});

		return res.json(
			Common.createSuccessResponseModel(1, newCustomer.toObject())
		);
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

const getCustomerPurchaseHistory = async (req, res) => {
	try {
		const invoices = await Invoice.find({
			customer: req.body.customerId,
		})
			.populate("customer", "fullName")
			.populate("salesStaff", "fullName")
			.sort({ createdAt: -1 });

		const getInvoiceItems = async (invoice) => {
			const invoiceObj = invoice.toObject();
			const invoiceItems = await InvoiceItem.find({ invoice: invoice._id });
			invoiceObj.totalPrice = 0;
			invoiceObj.totalProducts = 0;

			invoiceItems.forEach((item) => {
				invoiceObj.totalPrice += item.unitPrice * item.quantity;
				invoiceObj.totalProducts += item.quantity;
			});

			return invoiceObj;
		};

		const updatedInvoices = await Promise.all(invoices.map(getInvoiceItems));

		return res.json(
			Common.createSuccessResponseModel(updatedInvoices.length, updatedInvoices)
		);
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

const getCustomerInvoiceDetail = async (req, res) => {
	try {
		const invoice = await Invoice.findOne({
			_id: req.body.invoiceId,
		})
			.populate("customer", "fullName")
			.populate("salesStaff", "fullName");

		if (invoice) {
			const invoiceObj = invoice.toObject();
			const invoiceItems = await InvoiceItem.find({
				invoice: invoice._id,
			}).populate("product", "name");
			const productsWithCategoryNames = await getProductWithCategoryName();

			invoiceItems.forEach((item) => {
				item.product = productsWithCategoryNames.find(
					(product) => product._id.toString() === item.product.toString()
				);
			});

			invoiceObj.products = invoiceItems;
			invoiceObj.totalPrice = 0;
			invoiceObj.totalProducts = 0;

			invoiceItems.forEach((item) => {
				invoiceObj.totalPrice += item.unitPrice * item.quantity;
				invoiceObj.totalProducts += item.quantity;
			});

			return res.json(Common.createSuccessResponseModel(1, invoiceObj));
		} else {
			return res.json(
				Common.createResponseModel(404, "Không tìm thấy hóa đơn này")
			);
		}
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

//hàm random barcode
const generateSixDigitNumber = () => {
	// Tạo số ngẫu nhiên từ 100000 đến 999999 (bao gồm cả hai đầu)
	const randomNumber = Math.floor(Math.random() * 900000) + 100000;

	return randomNumber;
};

module.exports = {
	getAllProducts: getAllProducts,
	addProduct: addProduct,
	getCustomerProfile,
	addNewCustomerProfile,
	getCustomerPurchaseHistory,
	getCustomerInvoiceDetail,
	upload: upload,
};
