const multer = require("multer");
const bcrypt = require("bcrypt");
const puppeteer = require("puppeteer");
const path = require("path");
const handlebars = require("handlebars");
const fs = require("fs");

const Mail = require("../common/sendMail");
const Common = require("../common/Common");
const Model = require("../models/Products");
const { Customer } = require("../models/Customer");
const { Invoice, InvoiceItem } = require("../models/Invoice");
const User = require("../models/Users");
const Cart = require("../models/Carts");

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
    const listProducts = await Model.Products.find({ isDeleted: false });
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
    console.log(p);
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

const getProductByBarcodeOrName = async (req, res) => {
  try {
    let products;
    const searchPattern =
      req.params.barcode === "all"
        ? {} // If searching for all products, provide an empty filter
        : {
            $or: [
              { barCode: { $regex: new RegExp(req.params.barcode, "i") } }, // Exact match for barcode
              { name: { $regex: new RegExp(req.params.barcode, "i") } },
            ],
          };

    products = await Model.Products.find(searchPattern);
    if (products) {
      return res.json(Common.createSuccessResponseModel(1, products));
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

const createInvoice = async (req, res) => {
  try {
    const listItems = req.body.items;
    for (const cartItem of listItems) {
      // Find the corresponding product
      const product = await Model.Products.findById({
        _id: cartItem.idProduct,
      });

      // Update the saleNumber of the product based on the quantity in the cart
      if (product) {
        product.saleNumber += cartItem.quantity;
        await product.save();
      }
    }
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

    const invoice = await Invoice.create({
      invoiceCode: generateSixDigitNumber(),
      customer: customer._id,
      salesStaff: req.session.idUser,
      receiveMoney: req.body.receiveMoney,
      excessMoney: req.body.moneyBack,
      totalMoney: req.body.totalMoney,
      quantity: req.body.quantity,
    });

    // Use Promise.all for concurrent operations
    await Promise.all(
      listItems.map(async (i) => {
        const itemNew = new InvoiceItem({
          invoice: invoice._id,
          product: i.idProduct,
          quantity: i.quantity,
          unitPrice: i.totalMoney,
        });
        await itemNew.save();
      })
    );

    // Delete cart items after saving invoice items
    await Cart.deleteMany({ idSalePeople: req.session.idUser });

    const templateHtml = fs.readFileSync(
      path.join(__dirname, "../views/invoice.handlebars"),
      "utf8"
    );
    const template = handlebars.compile(templateHtml);
    const data = {
      invoice: invoice._id,
      customerName: req.body.fullName,
      salesStaffName: req.session.fullName,
      address: req.body.address,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      totalPrice: req.body.totalMoney,
      totalProducts: req.body.quantity,
      receiveMoney: req.body.receiveMoney,
      excessMoney: req.body.moneyBack,
      products: listItems,
    };

    const html = template(data);

    // Use await directly instead of IIFE
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(html);

    // Generate the PDF
    const outputPath = invoice._id + ".pdf";
    await page.pdf({ path: "./public/" + outputPath, format: "A4" });

    await browser.close();

    console.log("PDF created successfully");
    const downloadLink = `${req.protocol}://${req.get("host")}/` + outputPath;
    console.log(downloadLink);

    return res.json(
      Common.createSuccessResponseModel(0, {
        downloadLink,
        urlRedirect: `/pay-success/${invoice._id}`,
      })
    );
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
  try {
    const user = await User.findById(req.params.id);
    if (user.isDeleted) {
      user.isDeleted = false;
    } else {
      user.isDeleted = true;
    }
    user.save();

    return res.json(Common.createSuccessResponseModel(0, true));
  } catch (error) {}
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
        false
      )
    );
  }
};

//add product to cart
const addToCart = async (req, res) => {
  try {
    const barCode = req.params.barCode;
    const product = await Model.Products.findOne({ barCode: barCode });
    if (!product) {
      return res.json(
        Common.createResponseModel(404, "Không tìm thấy sản phẩm")
      );
    }

    // Check if the product already exists in the cart
    const existingCartItem = await Cart.findOne({ idProduct: product._id });

    if (existingCartItem) {
      // If the product exists, update the quantity and total amount
      existingCartItem.quantity += 1;
      existingCartItem.totalMoney =
        existingCartItem.quantity * product.priceSale;
      await existingCartItem.save();
    } else {
      const newCartItem = new Cart({
        idSalePeople: req.session.idUser,
        idProduct: product._id,
        name: product.name,
        imageLink: product.imageLink,
        salePrice: product.priceSale,
        quantity: 1,
        totalMoney: product.priceSale, // Assuming the price is the total amount in this case
      });
      await newCartItem.save();
    }

    return res.json(Common.createSuccessResponseModel(1, true));
  } catch (error) {
    console.error("Error:", error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const getAllCarts = async (req, res) => {
  try {
    const list = await Cart.find();
    return res.json(Common.createSuccessResponseModel(list.length, list));
  } catch (error) {
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { id, value } = req.body;
    console.log(id, value);
    const existingCartItem = await Cart.findOne({ _id: id });
    console.log(existingCartItem);
    existingCartItem.quantity = value;
    existingCartItem.totalMoney = value * existingCartItem.salePrice;
    await existingCartItem.save();
    return res.json(Common.createSuccessResponseModel(0, true));
  } catch (error) {
    console.error("Error:", error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const deleteItemInCart = async (req, res) => {
  try {
    await Cart.deleteOne({ _id: req.params.id });
    return res.json(Common.createSuccessResponseModel());
  } catch (error) {
    console.error("Error:", error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const getInfoCart = async (req, res) => {
  try {
    console.log(req.session.idUser);
    const cartItems = await Cart.find({ idSalePeople: req.session.idUser });

    let totalQuantity = 0;
    let totalAmount = 0;
    // Iterate over each cart item
    cartItems.forEach((cartItem) => {
      totalQuantity += cartItem.quantity;
      totalAmount += cartItem.totalMoney;
    });

    const result = {
      totalQuantity: totalQuantity,
      totalAmount: totalAmount,
      cartItems: cartItems,
    };

    return res.json(Common.createSuccessResponseModel(1, result));
  } catch (error) {
    console.error("Error:", error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const getStatistical = async (req, res) => {
  const listInvoices = await Invoice.find();
  const listUser = await User.find({
    isDeleted: false,
    role: { $ne: "admin" },
  });
  let totalMoney = 0;
  let totalQuantity = 0;
  listInvoices.forEach((e) => {
    totalMoney += e.totalMoney;
    totalQuantity += e.quantity;
  });

  const data = {
    money: totalMoney,
    quantity: totalQuantity,
    invoiceNumber: listInvoices.length,
    userNumber: listUser.length,
  };

  return res.json(Common.createSuccessResponseModel(1, data));
};

const getStatisticalByDate = async (req, res) => {
  try {
    const fromDate = new Date(req.body.fromDate);
    const toDate = new Date(req.body.toDate);
    console.log(fromDate, toDate);
    const invoices = await Invoice.find({
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    const invoicesWithDetails = [];
    for (const invoice of invoices) {
      const employee = await User.findById(invoice.salesStaff);
      const customer = await Customer.findById(invoice.customer);

      const invoiceWithDetail = {
        ...invoice.toObject(),
        employeeName: employee.fullName,
        customerName: customer.fullName,
      };
      invoicesWithDetails.push(invoiceWithDetail);
    }
    return res.json(
      Common.createSuccessResponseModel(
        invoicesWithDetails.length ?? 0,
        invoicesWithDetails ?? null
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
  }
};

const getDetailInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceCode: req.params.id });
    //find item in invoice
    const items = await InvoiceItem.find({ invoice: invoice._id });
    const result = [];
    for (const item of items) {
      console.log(item);
      const product = await Model.Products.findOne({ _id: item.product });
      const s = {
        ...item.toObject(),
        productName: product.name,
      };
      result.push(s);
    }
    console.log(result);
    return res.json(
      Common.createSuccessResponseModel(result.length ?? 0, result ?? null)
    );
  } catch (error) {
    console.log(error);
    return res.json(Common.createResponseModel(500, "Vui lòng thử lại."));
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
  const timestamp = String(currentDate.getTime()).slice(0, 4);

  // Combine the date string and timestamp
  const resultString = dateString + timestamp;

  return resultString;
}

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
  getProductByBarcode: getProductByBarcodeOrName,
  addToCart: addToCart,
  getAllCarts: getAllCarts,
  updateQuantity: updateQuantity,
  deleteItemInCart: deleteItemInCart,
  getInfoCart: getInfoCart,
  getStatistical: getStatistical,
  getStatisticalByDate: getStatisticalByDate,
  getDetailInvoices: getDetailInvoices,
};
