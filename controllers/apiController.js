const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");

const Mail = require("../common/sendMail");
const Common = require("../common/Common");
const Model = require("../models/Products");
const { Customer } = require("../models/Customer");
const { Invoice, InvoiceItem } = require("../models/Invoice");
const User = require("../models/Users");

//setup folder save file
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Set the destination folder for uploaded files
		cb(null, "./public/images/");
	},
	filename: function (req, file, cb) {
		const nameProduct = req.body.productName ?? generateSixDigitNumber();
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

	const newData = {
		barCode: generateSixDigitNumber(),
		name: req.body.productName,
		screenSize: req.body.size,
		ram: req.body.ram + " GB",
		rom: req.body.rom + " GB",
		importPrice: req.body.importPrice,
		priceSale: req.body.salePrice,
		description: req.body.description,
		imageLink: req.file.path.match(/public(.*)/)?.[1],
		saleNumber: 0,
		creationDate: new Date(),
		category: categories._id, // Replace with the actual category ObjectId
		isDeleted: false,
	};

	//save to db
	await Model.Products.create(newData)
		.then((createdProduct) => {
			res.json(
				Common.createSuccessResponseModel(1, {
					...createdProduct.toObject(),
					categoryName: req.body.category,
				})
			);
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

const deleteProduct = async (req, res) => {
	try {
		const idProduct = parseInt(req.params.id, 10);
		const p = await Model.Products.findOne({ barCode: idProduct });
		if (p.saleNumber > 0)
			return res.json(
				Common.createResponseModel(
					404,
					"Sản phẩm đã được bán ra, không thể xoá",
					false
				)
			);
		const isDeleted = await Model.Products.updateOne(
			{ barCode: idProduct },
			{
				$set: {
					isDeleted: true,
				},
			}
		);
		if (isDeleted.modifiedCount > 0)
			return res.json(Common.createResponseModel(200, "Successful", true));

		return res.json(Common.createErrorResponseModel());
	} catch (error) {
		console.error("Error deleting product:", error);
		return res.json(Common.createErrorResponseModel());
	}
};

const updateProduct = async (req, res) => {
	let isUpdated;
	if (req.file === undefined) {
		console.log(126);
		isUpdated = await Model.Products.updateOne(
			{ barCode: req.body.barCode },
			{
				$set: {
					name: req.body.productNameUpdate,
					importPrice: req.body.importPriceUpdate,
					salePrice: req.body.salePriceUpdate,
					ram: req.body.ramUpdate + " GB",
					rom: req.body.romUpdate + " GB",
					saleNumber: req.body.saleNumber,
					updatedDate: new Date(),
				},
			}
		);
	} else {
		isUpdated = await Model.Products.updateOne(
			{ barCode: req.body.barCode },
			{
				$set: {
					name: req.body.productNameUpdate,
					importPrice: req.body.importPriceUpdate,
					salePrice: req.body.salePriceUpdate,
					imageLink: req.file.path.match(/public(.*)/)?.[1],
					ram: req.body.ramUpdate + " GB",
					rom: req.body.romUpdate + " GB",
					saleNumber: req.body.saleNumber,
					updatedDate: new Date(),
				},
			}
		);
	}
	if (isUpdated.modifiedCount > 0)
		return res.json(Common.createResponseModel(200, "Successful", true));

	return res.json(Common.createErrorResponseModel());
};

const getProductByBarcode = async (req, res) => {
	try {
		const product = await Model.Products.findOne({
			barCode: req.params.barcode,
		});

		if (product) {
			return res.json(Common.createSuccessResponseModel(1, product.toObject()));
		} else {
			return res.json(
				Common.createResponseModel(404, "Không tìm thấy sản phẩm")
			);
		}
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
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

const createInvoice = async (req, res, next) => {
	try {
		let customer = await Customer.findOne({
			phoneNumber: req.body.phoneNumber,
		});
		if (!customer) {
			customer = await Customer.create({
				phoneNumber: req.body.phoneNumber,
				fullName: req.body.fullName,
				address: req.body.address,
			});
		}

		const products = await Model.Products.find({});

		const totalPrice = req.body.invoiceItems.reduce(
			(acc, { productId, quantity }) => {
				const product = products.find(
					(product) => product._id.toString() === productId.toString()
				);
				return acc + quantity * product.priceSale;
			},
			0
		);

		if (totalPrice > req.body.receiveMoney) {
			return res.json(Common.createResponseModel(400, "Không đủ tiền"));
		}

		const invoice = await Invoice.create({
			invoiceCode: generateInvoiceCode(),
			customer: customer._id,
			salesStaff: req.body.salesStaffId ?? "65645b03ae63f396312e5dbf",
			receiveMoney: req.body.receiveMoney,
			excessMoney: req.body.receiveMoney - totalPrice,
		});

		await Promise.all(
			req.body.invoiceItems.map(async ({ productId, quantity }) => {
				const product = products.find(
					(product) => product._id.toString() === productId.toString()
				);
				await InvoiceItem.create({
					invoice: invoice._id,
					product: product._id,
					quantity: quantity,
					unitPrice: product.priceSale,
				});
			})
		);

		req.invoiceCode = invoice.invoiceCode;
		next();
	} catch (error) {
		console.error("Error:", error);
		return res.json(
			Common.createResponseModel(500, "Vui lòng đợi trong ít phút.")
		);
	}
};

const getAllUser = async (req, res) => {
	try {
		const listUser = await User.find({
			isDeleted: false,
			role: { $ne: "admin" },
		});
		return res.json(
			Common.createSuccessResponseModel(listUser.length, listUser)
		);
	} catch (error) {
		// Handle errors appropriately
		console.error(error);
		return res
			.status(500)
			.json(Common.createErrorResponseModel("Internal Server Error"));
	}
};

const deleteUser = async (req, res) => {
	const isDeleted = await User.updateOne(
		{ _id: req.params.id },
		{
			$set: {
				isDeleted: true,
			},
		}
	);
	if (isDeleted.modifiedCount > 0) {
		return res.json(Common.createSuccessResponseModel(0, true));
	}
	return res.json(
		Common.createResponseModel(400, "Vui lòng thử lại sau.", false)
	);
};

const reactivateAccount = async (req, res) => {
	try {
		const userExist = await User.findOneAndUpdate(
			{ _id: req.body.id },
			{
				$set: {
					activationToken: Common.generateRandomToken(100),
					activationExpires: new Date(),
				},
			}
		);

		Mail.sendMail(
			userExist.email,
			userExist.activationToken,
			userExist.username
		);
		return res.json(Common.createSuccessResponseModel(0, true));
	} catch (error) {
		return res.json(
			Common.createResponseModel(400, "Vui lòng thử lại sau.", false)
		);
	}
};

const uploadAvatar = async (req, res) => {
	try {
		const isUpdated = await User.updateOne(
			{ _id: req.body.id },
			{
				$set: {
					avatar: req.file.path.match(/public(.*)/)?.[1],
				},
			}
		);
		if (isUpdated.modifiedCount > 0) {
			return res.json(Common.createSuccessResponseModel(0, true));
		}
		return res.json(
			Common.createResponseModel(400, "Vui lòng thử lại sau.", false)
		);
	} catch (error) {
		return res.json(
			Common.createResponseModel(400, "Vui lòng thử lại sau.", error)
		);
	}
};

const getInfoMine = async (req, res) => {
	const info = await User.findOne({ fullName: req.session.fullName });
	return res.json(Common.createSuccessResponseModel(1, info));
};

const changePassword = async (req, res) => {
	const { id, oldPassword, password } = req.body;
	const existUser = await User.findOne({
		_id: id,
		isDeleted: false,
	});
	const match = await bcrypt.compare(oldPassword, existUser.password);
	if (match) {
		const salt = await bcrypt.genSalt(10);

		// Mã hóa password kết hợp với salt
		const hash = await bcrypt.hash(password, salt);
		const isUpdated = await User.updateOne(
			{ _id: id },
			{ $set: { password: hash } }
		);
		if (isUpdated.modifiedCount > 0) {
			return res.json(Common.createSuccessResponseModel(0, true));
		}
		return res.json(
			Common.createResponseModel(400, "Vui lòng thử lại sau.", false)
		);
	} else {
		return res.json(
			Common.createResponseModel(
				400,
				"Mật khẩu cũ hiện tại không đúng, vui lòng thử lại",
				error
			)
		);
	}
};
//hàm random barcode
const generateSixDigitNumber = () => {
	// Tạo số ngẫu nhiên từ 100000 đến 999999 (bao gồm cả hai đầu)
	const randomNumber = Math.floor(Math.random() * 900000) + 100000;

	return randomNumber;
};

function generateInvoiceCode() {
	// Get current date
	const currentDate = new Date();

	// Extract day, month, and year components
	const day = String(currentDate.getDate()).padStart(2, "0");
	const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
	const year = currentDate.getFullYear();

	// Combine the date components
	const dateString = `${month}${day}${year}`;

	// Get current timestamp and take the first 4 characters
	const timestamp = String(currentDate.getTime()).slice(-4);

	// Combine the date string and timestamp
	const resultString = dateString + timestamp;
	console.log(resultString);

	return resultString;
}

const generateInvoicePdf = async (req, res) => {
	const invoice = await Invoice.findOne({
		invoiceCode: req.invoiceCode,
	})
		.populate("customer", "fullName")
		.populate("salesStaff", "fullName");
	console.log(invoice, req.invoiceCode);

	const invoiceObj = invoice.toObject();
	const invoiceItems = await InvoiceItem.find({
		invoice: invoice._id,
	})
		.populate("product", "name ram rom")
		.lean();

	invoiceObj.products = invoiceItems;
	invoiceObj.totalPrice = 0;
	invoiceObj.totalProducts = 0;

	invoiceItems.forEach((item) => {
		invoiceObj.totalPrice += item.unitPrice * item.quantity;
		invoiceObj.totalProducts += item.quantity;
		item.unitPrice = Number(item.unitPrice).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		});
		item.totalProductPrice = Number(
			item.unitPrice * item.quantity
		).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		});
	});

	invoiceObj.totalPrice = Number(invoiceObj.totalPrice).toLocaleString("vi", {
		style: "currency",
		currency: "VND",
	});

	const invoiceCode = req.invoiceCode;
	const templateHtml = fs.readFileSync(
		path.join(__dirname, "../views/pdf.handlebars"),
		"utf8"
	);

	const template = handlebars.compile(templateHtml);
	const data = {
		invoiceCode,
		customerName: invoiceObj.customer.fullName,
		salesStaffName: invoiceObj.salesStaff.fullName,
		createdAt: new Date(invoiceObj.createdAt).toLocaleDateString("vi-VN"),
		totalPrice: invoiceObj.totalPrice,
		totalProducts: invoiceObj.totalProducts,
		receiveMoney: invoiceObj.receiveMoney,
		excessMoney: invoiceObj.excessMoney,
		products: invoiceObj.products,
	};

	const html = template(data);

	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		// Set the HTML content of the page
		await page.setContent(html);

		// Generate the PDF
		const outputPath = "invoices/invoice_" + invoiceCode + ".pdf";
		await page.pdf({ path: "./public/" + outputPath, format: "A4" });

		await browser.close();

		console.log("PDF created successfully");
		const downloadLink = `${req.protocol}://${req.get("host")}/` + outputPath;
		return res.json(
			Common.createSuccessResponseModel(0, {
				downloadLink,
				invoiceCode,
			})
		);
	})();
};

module.exports = {
	getAllProducts: getAllProducts,
	addProduct: addProduct,
	getCustomerProfile: getCustomerProfile,
	addNewCustomerProfile: addNewCustomerProfile,
	getCustomerPurchaseHistory: getCustomerPurchaseHistory,
	getCustomerInvoiceDetail: getCustomerInvoiceDetail,
	upload: upload,
	deleteProduct: deleteProduct,
	updateProduct: updateProduct,
	getAllUser: getAllUser,
	deleteUser: deleteUser,
	reactivateAccount: reactivateAccount,
	uploadAvatar: uploadAvatar,
	getInfoMine: getInfoMine,
	changePassword: changePassword,
	createInvoice: createInvoice,
	getProductByBarcode: getProductByBarcode,
	generateInvoicePdf: generateInvoicePdf,
};
