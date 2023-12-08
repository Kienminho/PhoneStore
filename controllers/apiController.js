const multer = require("multer");

const Common = require("../common/Common");
const Model = require("../models/Products");

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

//hàm random barcode
const generateSixDigitNumber = () => {
  // Tạo số ngẫu nhiên từ 100000 đến 999999 (bao gồm cả hai đầu)
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;

  return randomNumber;
};

module.exports = {
  getAllProducts: getAllProducts,
  addProduct: addProduct,
  upload: upload,
  deleteProduct: deleteProduct,
  updateProduct: updateProduct,
};
