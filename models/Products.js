const mongoose = require("../common/configdb");

const categorySchema = new mongoose.Schema({
  nameCategory: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  barCode: { type: Number, required: true },
  name: { type: String, required: true },
  screenSize: { type: String, required: true },
  ram: { type: String, required: true },
  rom: { type: String, required: true },
  importPrice: { type: Number, required: true },
  priceSale: { type: Number, required: true },
  description: { type: String, required: true },
  imageLink: { type: String, required: true },
  saleNumber: { type: Number, required: true },
  creationDate: { type: Date, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
});

const Products = mongoose.model("Product", productSchema);
const Category = mongoose.model("Category", categorySchema);

module.exports = {
  Products,
  Category,
};
